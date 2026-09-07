import { config } from './config';
import { ClientBoundPacketType, sendPacket } from './protocol';
import { spectators, games } from './state';
import type { GameId, GameParameters, User } from './types';
import { GameStatus } from './types';

export async function createApiGame(gameParameters: GameParameters, firstPlayer: User, secondPlayer: User): Promise<GameId> {
  const response = await fetch(`${config.databaseAddress}/create_game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.gameServerKey}`,
    },
    body: JSON.stringify({
      firstPlayerId: firstPlayer.id,
      secondPlayerId: secondPlayer.id,
      gameParameters,
    }),
  });
  if (!response.ok) throw new Error(`API create_game failed with status ${response.status}`);
  const result = await response.json() as { gameId?: string };
  if (!result.gameId) throw new Error('API create_game returned no gameId');
  return result.gameId;
}

export async function endApiGame(gameId: GameId, status: GameStatus, moves: string, firstPlayerId: string, secondPlayerId: string): Promise<void> {
  const response = await fetch(`${config.databaseAddress}/end_game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.gameServerKey}`,
    },
    body: JSON.stringify({ gameId, status, moves, firstPlayerId, secondPlayerId }),
  });
  if (!response.ok) throw new Error(`API end_game failed with status ${response.status}`);
}

export function notifyGameEnd(gameId: GameId, status: GameStatus, moves: string, removeUser: (user: User, fromClose?: boolean) => void): void {
  const spectatorsSet = spectators.get(gameId);
  spectatorsSet?.forEach(user => {
    sendPacket(user.websocket, ClientBoundPacketType.GAME_END, { status, moves });
    removeUser(user, true);
  });
  spectators.delete(gameId);
  games.delete(gameId);
}
