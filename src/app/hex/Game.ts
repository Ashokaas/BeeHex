export default class Game {
  private grid_array: Array<Array<number>>;
  private player1: string;
  private player2: string;
  private me: string;

  constructor(size: number) {
    this.grid_array = Array.from({ length: size }, () => Array(size).fill(0));
    this.player1 = "";
    this.player2 = "";
    this.me = "";
  }

  getGridArray() {
    return this.grid_array;
  }

  setGridArray(newGrid: Array<Array<number>>) {
    this.grid_array = newGrid;
  }

  setPlayers(player1: string, player2: string) {
    this.player1 = player1;
    this.player2 = player2;
  }

  getPlayers() {
    return { player1: this.player1, player2: this.player2 };
  }

  setMe(me: string) {
    this.me = me;
  }

  getMe() {
    return this.me;
  }
}