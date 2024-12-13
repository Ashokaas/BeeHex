export default class Game {
  private grid_array: Array<Array<number>>;

  constructor(size: number) {
    this.grid_array = Array.from({ length: size }, () => Array(size).fill(0));
  }

  getGridArray() {
    return this.grid_array;
  }

  setGridArray(newGrid: Array<Array<number>>) {
    this.grid_array = newGrid;
  }
}