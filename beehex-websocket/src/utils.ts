import type { GameHash, GameParameters } from './types';

export function hashGameParameters(parameters: GameParameters): GameHash {
  const mode = parameters.ranked ? 'Ranked' : 'Casual';
  return `${mode}_${parameters.board_size}`;
}

export function hashXY(x: number, y: number, size: number): number {
  return x + y * size;
}
