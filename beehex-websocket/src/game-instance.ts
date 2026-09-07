import type { ServerWebSocket } from 'bun';
import { endApiGame, notifyGameEnd } from './api-client';
import { ClientBoundPacketType, sendPacket } from './protocol';
import { spectators } from './state';
import { GameStatus, type Game, type GameId, type GameParameters, type UserId } from './types';
import { hashXY } from './utils';

export class GameInstance implements Game {
  public readonly game_id: string;
  public readonly game_parameters: GameParameters;
  public readonly grid: number[][];
  public readonly first_player_id: string;
  public readonly second_player_id: string;
  public turn = 1;
  private readonly moves: Array<[number, number]> = [];
  private ended = false;

  constructor(gameId: string, gameParameters: GameParameters, firstPlayerId: string, secondPlayerId: string) {
    this.game_id = gameId;
    this.game_parameters = gameParameters;
    this.grid = Array.from({ length: gameParameters.board_size }, () => Array(gameParameters.board_size).fill(0));
    this.first_player_id = firstPlayerId;
    this.second_player_id = secondPlayerId;
  }

  playMove(x: number, y: number, removeUser: (user: import('./types').User, fromClose?: boolean) => void): void {
    if (this.ended || !this.grid[x] || this.grid[x][y] !== 0) return;
    this.grid[x][y] = this.turn % 2 === 0 ? 2 : 1;
    this.moves.push([x, y]);
    spectators.get(this.game_id)?.forEach(user => {
      sendPacket(user.websocket, ClientBoundPacketType.MOVE_PLAYED, {
        x, y, turn: this.turn + 1, grid_array: this.grid,
      });
    });
    if (this.checkForWinnerXY(x, y).winner) {
      void this.endGame(this.turn % 2 === 0 ? GameStatus.SECOND_PLAYER_WIN : GameStatus.FIRST_PLAYER_WIN, removeUser);
    }
    this.turn++;
  }

  async endGame(status: GameStatus, removeUser: (user: import('./types').User, fromClose?: boolean) => void): Promise<void> {
    if (this.ended) return;
    this.ended = true;
    const moves = this.exportMoves();
    try {
      await endApiGame(this.game_id, status, moves, this.first_player_id, this.second_player_id);
      notifyGameEnd(this.game_id, status, moves, removeUser);
    } catch (error) {
      console.error('Failed to persist game end', error);
      notifyGameEnd(this.game_id, GameStatus.ABORTED, moves, removeUser);
    }
  }

  exportGame(): Game {
    return {
      game_id: this.game_id,
      game_parameters: this.game_parameters,
      grid: this.grid,
      first_player_id: this.first_player_id,
      second_player_id: this.second_player_id,
      turn: this.turn,
    };
  }

  exportMoves(): string {
    return this.moves.map(([x, y]) => hashXY(x, y, this.grid.length)).join(' ');
  }

  checkForWinnerXY(x: number, y: number): { winner: boolean; winningHexagons: Array<[number, number]> } {
    const state = this.grid[x]?.[y];
    if (state !== 1 && state !== 2) return { winner: false, winningHexagons: [] };
    const pending: Array<[number, number]> = [[x, y]];
    const checked = new Set<number>();
    const winningHexagons: Array<[number, number]> = [];
    let lowerBound = false;
    let higherBound = false;

    while (pending.length > 0) {
      const hexagon = pending.pop()!;
      const hash = hashXY(hexagon[0], hexagon[1], this.grid.length);
      if (checked.has(hash)) continue;
      checked.add(hash);
      winningHexagons.push(hexagon);
      if (state === 1) {
        lowerBound ||= hexagon[1] === 0;
        higherBound ||= hexagon[1] === this.game_parameters.board_size - 1;
      } else {
        lowerBound ||= hexagon[0] === 0;
        higherBound ||= hexagon[0] === this.game_parameters.board_size - 1;
      }
      if (lowerBound && higherBound) return { winner: true, winningHexagons };
      for (const neighbor of this.getSurroundingHexagons(hexagon[0], hexagon[1])) {
        if (this.grid[neighbor[0]]?.[neighbor[1]] === state) pending.push(neighbor);
      }
    }
    return { winner: false, winningHexagons: [] };
  }

  private getSurroundingHexagons(x: number, y: number): Array<[number, number]> {
    const size = this.game_parameters.board_size;
    const neighbors: Array<[number, number]> = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y + 1], [x + 1, y - 1],
    ];
    return neighbors.filter(([neighborX, neighborY]) => neighborX >= 0 && neighborX < size && neighborY >= 0 && neighborY < size);
  }
}
