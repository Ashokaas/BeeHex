import type { ServerWebSocket } from 'bun';

export type UserId = string;
export type RoomId = string;
export type GameId = string;
export type GameHash = string;

export type GameParameters = {
  ranked: boolean;
  board_size: number;
};

export interface Game {
  game_id: string;
  game_parameters: GameParameters;
  grid: number[][];
  first_player_id: string;
  second_player_id: string;
  turn: number;
}

export enum UserStatus {
  IDLE = 0,
  IN_GAME = 1,
  SEARCHING_GAME = 2,
  IN_ROOM = 3,
}

export enum GameStatus {
  IN_PROGRESS = 0,
  FIRST_PLAYER_WIN = 1,
  SECOND_PLAYER_WIN = 2,
  DRAW = 3,
  ABORTED = 4,
}

export type User = {
  id: UserId;
  websocket: ServerWebSocket<UserId>;
  status: UserStatus;
  lastHeartbeat: number;
  gameId?: GameId;
  roomId?: RoomId;
  searchedGameParameters?: GameParameters;
};

export type ServerBoundPacket = {
  type: number;
  [key: string]: unknown;
};
