export const BOARD_SIZES = [5, 7, 9, 11, 13];
export const TIME_LIMITS = [0, 180, 300, 600];

export type UserId = string;
export type RoomId = string;
export type GameId = string;

export interface DatabaseGame {
  gameId: GameId;
  gameParameters: GameParameters;
  firstPlayerId: UserId;
  secondPlayerId: UserId;
  gameDate: EpochTimeStamp;
  status: GameStatus;
  moves?: string;
}

export interface Game {
  game_id: string;
  game_parameters: GameParameters | LocalGameParameters;
  grid: Array<Array<number>>;
  first_player_id: string;
  second_player_id: string;
  turn: number;
}

export interface GameParameters {
  ranked: boolean;
  board_size: number;
  time_limit: number;
}
export interface LocalGameParameters {
  time_limit: number,
  board_size: number
}


export enum UserStatus {
  IDLE = 0, // En théorie, seulement utilisé pendant le court temps d'authentification du joueur à la connexion, le client devrait envoyer une recherche ou un id de partie rapidement après
  IN_GAME = 1,
  SEARCHING_GAME = 2
}


export enum GameStatus {
  IN_PROGRESS = 0,
  FIRST_PLAYER_WIN = 1,
  SECOND_PLAYER_WIN = 2,
  DRAW = 3, // Egalité impossible, sauf si demandé par les joueurs, non implémenté
  ABORTED = 4 // À utiliser si un joueur quitte la partie avant son premier coup, ou que le serveur rencontre une erreur/crash, non implémenté
}

export enum ClientBoundPacketType {
  ERROR_MESSAGE = 0,
  GAME_SEARCH = 1,
  GAME_FOUND = 2,
  JOIN_GAME = 3,
  MOVE_PLAYED = 4,
  GAME_END = 5
}

export enum ServerBoundPacketType {
  GAME_SEARCH = 0,
  CANCEL_GAME_SEARCH = 1,
  JOIN_GAME = 2,
  JOIN_ROOM = 3,
  PLAY_MOVE = 4,
  FORFEIT_GAME = 5

}

export interface ClientBoundGenericPacket {
  type: ClientBoundPacketType;
}

export interface ClientBoundErrorMessagePacket {
  type: ClientBoundPacketType.ERROR_MESSAGE;
  message: string;
}

export interface ClientBoundGameSearchPacket {
  type: ClientBoundPacketType.GAME_SEARCH;
  game_parameters: GameParameters;
  player_count: number;
  elo_range: [number, number];
}

export interface ClientBoundGameFoundPacket {
  type: ClientBoundPacketType.GAME_FOUND;
  game_id: GameId;
}

export interface ClientBoundJoinGamePacket { // Envoyé lorsque un joueur/spectateur rejoint une partie
  type: ClientBoundPacketType.JOIN_GAME;
  game: Game;
  // TODO: ajouter le timer
}

export interface ClientBoundMovePlayedPacket {
  type: ClientBoundPacketType.MOVE_PLAYED;
  x: number;
  y: number;
  turn: number;
  grid_array: Array<Array<number>>;
}

export interface ClientBoundGameEndPacket {
  type: ClientBoundPacketType.GAME_END;
  status: GameStatus;
  moves: string;
}

export interface ServerBoundGenericPacket {
  type: ServerBoundPacketType;
}

export interface ServerBoundGameSearchPacket {
  type: ServerBoundPacketType.GAME_SEARCH;
  game_parameters: GameParameters;
}

export interface ServerBoundCancelGameSearchPacket {
  type: ServerBoundPacketType.CANCEL_GAME_SEARCH;
}

export interface ServerBoundJoinGamePacket {
  type: ServerBoundPacketType.JOIN_GAME;
  game_id: GameId;
}

export interface ServerBoundJoinRoomPacket {
  type: ServerBoundPacketType.JOIN_ROOM;
  room_id: RoomId;
}

export interface ServerBoundPlayMovePacket {
  type: ServerBoundPacketType.PLAY_MOVE;
  x: number;
  y: number;
}

export interface ServerBoundForfeitGamePacket {
  type: ServerBoundPacketType.FORFEIT_GAME;
}

export enum AlgorithmWorkerBoundPacketType {
  EXPLORE_INSTANCE = 0,
  SET_ID = 1
}

export enum AlgorithmExplorerBoundPacketType {
  RESULT = 0
}

export interface AlgorithmWorkerBoundGenericPacket {
  type: AlgorithmWorkerBoundPacketType;
}

export interface AlgorithmWorkerBoundExplorePacket {
  type: AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE;
  id: string;
  game: RawScoredGameInstance;
}

export interface AlgorithmWorkerBoundSetIdPacket {
  type: AlgorithmWorkerBoundPacketType.SET_ID;
  id: number;
}

export interface AlgorithmExplorerBoundGenericPacket {
  type: AlgorithmExplorerBoundPacketType;
}

export interface AlgorithmExplorerBoundResultPacket {
  type: AlgorithmExplorerBoundPacketType.RESULT;
  id: string;
  result: ExploreResult;
}
export type Coordinate = [number, number]; // [y, x]
export type GridHash = string; // Représentation de la grille sous forme de chaîne de caractères (ex: ["100", "110", "000"] => "100110000")
// Les web workers ne peuvent recevoir en message que des objets composés de certains types (primitifs, Map, Set, Array, etc.)
export interface RawSimpleGameInstance {
  grid: Array<Array<number>>;
  turn: number;
  moves: Array<Coordinate>;
}

export interface RawScoredGameInstance extends RawSimpleGameInstance {
  score: RawScore;
  nextInstances: Map<number, GridHash>;
}

export interface RawScore {
  score: number; 
  isWinCountdown: boolean; // true si le score est un nombre de coups avant la victoire
  // Lorsque le Score indique un joueur qui a gagné, isWinCountdown = true et score = 0.5 si le joueur 1 a gagné, -0.5 si le joueur 2 a gagné 
}

export interface ExploreResult {
  gameInstances: Map<GridHash, RawScoredGameInstance>;
  leaves: Array<GridHash>; // Feuilles de l'arbre d'exploration, donc les instances qui peuvent encore être explorées
}


