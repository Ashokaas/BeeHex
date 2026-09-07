import type { ServerWebSocket } from 'bun';
import type { GameHash, GameId, RoomId, User, UserId } from './types';
import { config } from './config';
import { hashGameParameters } from './utils';
import type { GameInstance } from './game-instance';

export const spectators = new Map<GameId, Set<User>>();
export const clients = new Map<ServerWebSocket<UserId>, User>();
export const games = new Map<GameId, GameInstance>();
export const queues = new Map<GameHash, User[]>();
export const rooms = new Map<RoomId, User>();

export function initializeQueues(): void {
  for (const board_size of config.boardSizes) {
    queues.set(hashGameParameters({ ranked: true, board_size }), []);
    queues.set(hashGameParameters({ ranked: false, board_size }), []);
  }
}
