import { createApiGame } from './api-client';
import { ClientBoundPacketType, sendPacket } from './protocol';
import { clients, games, queues, rooms, spectators } from './state';
import { GameInstance } from './game-instance';
import { GameStatus, UserStatus, type GameParameters, type User } from './types';
import { hashGameParameters } from './utils';

export function removeUser(user: User | undefined, fromClose = false): void {
  if (!user) return;
  if (!fromClose) {
    user.websocket.close();
    return;
  }
  if (user.gameId) spectators.get(user.gameId)?.delete(user);
  if (user.roomId && rooms.get(user.roomId)?.id === user.id) rooms.delete(user.roomId);
  if (user.searchedGameParameters) {
    const queue = queues.get(hashGameParameters(user.searchedGameParameters));
    if (queue) {
      const index = queue.indexOf(user);
      if (index >= 0) queue.splice(index, 1);
    }
  }
  clients.delete(user.websocket);
}

export async function createGame(gameParameters: GameParameters, firstPlayer: User, secondPlayer: User): Promise<void> {
  try {
    const gameId = await createApiGame(gameParameters, firstPlayer, secondPlayer);
    games.set(gameId, new GameInstance(gameId, gameParameters, firstPlayer.id, secondPlayer.id));
    spectators.set(gameId, new Set());
    sendPacket(firstPlayer.websocket, ClientBoundPacketType.GAME_FOUND, { game_id: gameId });
    sendPacket(secondPlayer.websocket, ClientBoundPacketType.GAME_FOUND, { game_id: gameId });
    removeUser(firstPlayer);
    removeUser(secondPlayer);
  } catch (error) {
    console.error('Failed to create game', error);
    sendPacket(firstPlayer.websocket, ClientBoundPacketType.ERROR_MESSAGE, { message: 'Error: Failed to create game' });
    sendPacket(secondPlayer.websocket, ClientBoundPacketType.ERROR_MESSAGE, { message: 'Error: Failed to create game' });
    removeUser(firstPlayer);
    removeUser(secondPlayer);
  }
}

export function startIntervals(): void {
  setInterval(() => {
    for (const queue of queues.values()) {
      if (queue.length < 2) continue;
      const firstPlayer = queue.shift()!;
      const secondPlayer = queue.shift()!;
      void createGame(firstPlayer.searchedGameParameters!, firstPlayer, secondPlayer);
    }
  }, 1000);
}

export function cancelSearch(user: User): boolean {
  if (!user.searchedGameParameters) return false;
  const queue = queues.get(hashGameParameters(user.searchedGameParameters));
  if (!queue) return false;
  const index = queue.indexOf(user);
  if (index < 0) return false;
  queue.splice(index, 1);
  user.searchedGameParameters = undefined;
  user.status = UserStatus.IDLE;
  return true;
}

export function forfeitGame(user: User): void {
  if (!user.gameId) return;
  const game = games.get(user.gameId);
  if (!game) return;
  const status = user.id === game.first_player_id ? GameStatus.SECOND_PLAYER_WIN : GameStatus.FIRST_PLAYER_WIN;
  void game.endGame(status, removeUser);
}
