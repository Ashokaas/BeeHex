import { GameParameters, UserId, GameId, Game, LocalGameParameters } from "../../definitions";

export default class GameInstance {
  private game_id: GameId;
  private game_parameters: GameParameters|LocalGameParameters;
  private grid_array: Array<Array<number>>;
  private first_player_id: UserId;
  private second_player_id: UserId;
  private turn: number;
  private own_id: UserId;

  constructor(game_id: GameId, game_parameters: LocalGameParameters|GameParameters, grid_array: Array<Array<number>>, first_player_id: UserId, second_player_id: UserId, turn: number, own_id: UserId) {
    this.game_id = game_id;
    this.game_parameters = game_parameters;
    this.grid_array = grid_array;
    this.first_player_id = first_player_id;
    this.second_player_id = second_player_id;
    this.turn = turn;
    this.own_id = own_id;
  }

  static fromGame(game: Game, own_id: UserId) {
    return new GameInstance(
      game.game_id, 
      game.game_parameters, 
      game.grid, 
      game.first_player_id, 
      game.second_player_id, 
      game.turn, 
      own_id
    );
  }

  getGridArray() {
    return this.grid_array;
  }

  setGridArray(newGrid: Array<Array<number>>) {
    this.grid_array = newGrid;
  }

  updateGameState(grid_array: Array<Array<number>>, turn: number) {
    console.log(`${grid_array.join("|")}`)
    this.grid_array = grid_array;
    this.turn = turn;
  }

  getPlayers() {
    return [this.first_player_id, this.second_player_id];
  }

  getCurrentPlayer() {
    return this.turn % 2 === 0 ? this.second_player_id : this.first_player_id;
  }

  getOwnId() {
    return this.own_id;
  }

  isValidMove(i: number, j: number) {
    return this.grid_array[i][j] === 0;
  }

  isTurnOf(player_id: UserId) {
    return player_id === this.getCurrentPlayer();
  }
}