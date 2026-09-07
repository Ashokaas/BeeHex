import type { ServerWebSocket } from 'bun';
import { authenticateRequest } from './auth';
import { config } from './config';
import { GameStatus, UserStatus, type ServerBoundPacket, type User, type UserId } from './types';
import { clients, games, queues, rooms, spectators, initializeQueues } from './state';
import { cancelSearch, createGame, forfeitGame, removeUser, startIntervals } from './matchmaking';
import { ClientBoundPacketType, ServerBoundPacketType, hasCoordinates, hasString, isGameParameters, parsePacket, sendPacket } from './protocol';
import { hashGameParameters } from './utils';

function sendError(ws: ServerWebSocket<string>, message: string): void {
  sendPacket(ws, ClientBoundPacketType.ERROR_MESSAGE, { message });
}

function getUser(ws: ServerWebSocket<string>): User | undefined {
  return clients.get(ws);
}

function handlePacket(ws: ServerWebSocket<string>, packet: ServerBoundPacket): void {
  const user = getUser(ws);
  if (!user) return;

  switch (packet.type) {
    case ServerBoundPacketType.GAME_SEARCH: {
      if (!isGameParameters(packet.game_parameters)) {
        sendError(ws, 'Error: Invalid game parameters');
        return;
      }
      if (user.status !== UserStatus.IDLE) {
        sendError(ws, 'Error: Already searching a game / in a game');
        return;
      }
      const queue = queues.get(hashGameParameters(packet.game_parameters));
      if (!queue) {
        sendError(ws, 'Error: Invalid game parameters');
        return;
      }
      if (queue.some(candidate => candidate.id === user.id)) {
        sendError(ws, 'Error: Already in queue');
        return;
      }
      user.status = UserStatus.SEARCHING_GAME;
      user.searchedGameParameters = packet.game_parameters;
      queue.push(user);
      return;
    }
    case ServerBoundPacketType.CANCEL_GAME_SEARCH:
      if (user.status !== UserStatus.SEARCHING_GAME || !cancelSearch(user)) {
        sendError(ws, 'Error: Not searching a game');
      }
      return;
    case ServerBoundPacketType.JOIN_GAME:
      if (!hasString(packet, 'game_id')) {
        sendError(ws, 'Error: Invalid packet');
        return;
      }
      if (user.status !== UserStatus.IDLE) {
        sendError(ws, 'Error: Already in a game');
        return;
      }
      {
        const gameId = packet.game_id as string;
        const game = games.get(gameId);
        if (!game) {
          sendError(ws, 'Error: Game not found');
          return;
        }
        sendPacket(ws, ClientBoundPacketType.JOIN_GAME, { game: game.exportGame() });
        user.status = UserStatus.IN_GAME;
        user.gameId = gameId;
        spectators.get(gameId)?.add(user);
      }
      return;
    case ServerBoundPacketType.JOIN_ROOM:
      if (!hasString(packet, 'room_id') || !isGameParameters(packet.game_parameters)) {
        sendError(ws, 'Error: Invalid game parameters');
        return;
      }
      if (user.status !== UserStatus.IDLE) {
        sendError(ws, 'Error: Already in a game');
        return;
      }
      if ((packet.game_parameters as { ranked: boolean }).ranked) {
        sendError(ws, 'Error: Cannot be ranked');
        return;
      }
      {
        const parameters = packet.game_parameters as import('./types').GameParameters;
        const roomId = `${hashGameParameters(parameters)}_${(packet.room_id as string).replaceAll('_', '')}`;
        const waitingUser = rooms.get(roomId);
        if (!waitingUser) {
          rooms.set(roomId, user);
          user.status = UserStatus.IN_ROOM;
          user.roomId = roomId;
          user.searchedGameParameters = parameters;
        } else if (waitingUser.id === user.id) {
          sendError(ws, 'Error: Already in room');
        } else {
          rooms.delete(roomId);
          void createGame(parameters, waitingUser, user);
        }
      }
      return;
    case ServerBoundPacketType.PLAY_MOVE:
      if (!hasCoordinates(packet)) {
        sendError(ws, 'Error: Invalid packet');
        return;
      }
      if (user.status !== UserStatus.IN_GAME || !user.gameId) {
        sendError(ws, 'Error: Not in a game');
        return;
      }
      {
        const game = games.get(user.gameId);
        if (!game) {
          sendError(ws, 'Error: Game not found');
          return;
        }
        const currentPlayer = game.turn % 2 === 0 ? game.second_player_id : game.first_player_id;
        if (currentPlayer !== user.id) {
          sendError(ws, 'Error: Not your turn');
          return;
        }
        game.playMove(packet.x as number, packet.y as number, removeUser);
      }
      return;
    case ServerBoundPacketType.FORFEIT_GAME:
      if (user.status !== UserStatus.IN_GAME) {
        sendError(ws, 'Error: Not in a game');
        return;
      }
      forfeitGame(user);
      return;
    default:
      sendError(ws, 'Error: Unknown packet type');
  }
}

export function startServer(): ReturnType<typeof Bun.serve> {
  initializeQueues();
  startIntervals();
  return Bun.serve<UserId, string>({
    port: config.port,
    async fetch(request, server) {
      const auth = await authenticateRequest(request);
      if (auth.status !== 200 || !auth.userId) return new Response(auth.message, { status: auth.userId ? auth.status : 401 });
      if (server.upgrade(request, { data: auth.userId })) return;
      return new Response('WebSocket upgrade failed', { status: 500 });
    },
    websocket: {
      message(ws, message) {
        if (typeof message !== 'string') {
          sendError(ws, 'Invalid message format');
          return;
        }
        const packet = parsePacket(message);
        if (!packet) {
          sendError(ws, 'Invalid packet format');
          return;
        }
        try {
          handlePacket(ws, packet);
        } catch (error) {
          console.error('Unhandled websocket packet error', error);
          sendError(ws, 'Internal server error');
        }
      },
      open(ws) {
        clients.set(ws, { id: ws.data, websocket: ws, status: UserStatus.IDLE, lastHeartbeat: Date.now() });
      },
      pong(ws) {
        const user = getUser(ws);
        if (user) user.lastHeartbeat = Date.now();
      },
      close(ws) {
        removeUser(getUser(ws), true);
      },
    },
  });
}

export function startHeartbeat(): void {
  setInterval(() => {
    for (const [ws, user] of clients) {
      if (Date.now() - user.lastHeartbeat > config.heartbeatTimeout) {
        removeUser(user, true);
        ws.terminate();
      } else {
        ws.ping();
      }
    }
  }, config.heartbeatInterval);
}
