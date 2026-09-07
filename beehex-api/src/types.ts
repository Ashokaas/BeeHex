export type User = {
  id: string;
  username: string;
  password: string;
  mmr: number;
  registration_date: number;
};

export type PublicUser = Pick<User, 'id' | 'username' | 'mmr' | 'registration_date'>;

export enum GameStatus {
  IN_PROGRESS = 0,
  FIRST_PLAYER_WIN = 1,
  SECOND_PLAYER_WIN = 2,
  DRAW = 3,
  ABORTED = 4,
}

export type Game = {
  id?: string;
  gameId: string;
  gameParameters: unknown;
  firstPlayerId: string;
  secondPlayerId: string;
  status: GameStatus;
  gameDate: number;
  moves?: unknown;
  EloChangeFirstPlayer?: number;
  EloChangeSecondPlayer?: number;
};

export type GameHistoryRow = {
  gameId: string;
  gameDate: number;
  EloChangeFirstPlayer: number | null;
  EloChangeSecondPlayer: number | null;
  firstPlayerId: string;
  secondPlayerId: string;
  moves?: unknown;
  opponentId?: string;
  opponentUsername?: string | null;
  mmrAfterGame?: number;
};
