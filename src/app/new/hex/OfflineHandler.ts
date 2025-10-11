import * as packets from "../../definitions";

interface WebsocketCallbacks {
	errorCallback: (message: string) => void;
	gameSearchCallback: (game_parameters: packets.LocalGameParameters, player_count: number, elo_range: [number, number]) => void;
	gameFoundCallback: (game_id: packets.GameId) => void;
	joinGameCallback: (game: packets.Game) => void;
	movePlayedCallback: (x: number, y: number, turn: number, grid_array: Array<Array<number>>) => void;
	gameEndCallback: (status: packets.GameStatus, moves: string, winningHexagons: Array<[number, number]>) => void;
	connectionEndedCallback: () => void;
}
class GameInstance implements packets.Game {
	private handler: OfflineHandler;
	public game_id: string;
	public game_parameters: packets.LocalGameParameters;
	public grid: Array<Array<number>>;
	public first_player_id: string;
	public second_player_id: string;
	private moves: Array<[number, number]> = [];
	public turn: number;
  
	constructor(handler: OfflineHandler, game_id: string, gameParameters: packets.LocalGameParameters, firstPlayerId: string, secondPlayerId: string)
	{
		this.handler = handler;
		this.game_id = game_id;
		this.game_parameters = gameParameters;
		this.grid = Array.from({ length: gameParameters.board_size }, () => Array(gameParameters.board_size).fill(0));
		this.first_player_id = firstPlayerId;
		this.second_player_id = secondPlayerId;
		this.turn = 1;
	}
  
	playMove(x: number, y: number) {
		if (this.grid[x][y] !== 0) return;
		this.grid[x][y] = this.turn % 2 === 0 ? 2 : 1;
		this.handler.handlePacket({type: packets.ClientBoundPacketType.MOVE_PLAYED, 
			x: x, 
			y: y, 
			turn: this.turn + 1,
			grid_array: [...this.grid]} as packets.ClientBoundMovePlayedPacket)
		this.moves.push([x, y]);
		let { winner, winningHexagons } = this.checkForWinnerXY(x, y);
		if (winner) {
			this.endGame(this.turn % 2 === 0 ? packets.GameStatus.SECOND_PLAYER_WIN : packets.GameStatus.FIRST_PLAYER_WIN, winningHexagons);
		}
		this.turn++;
	}
  
	exportMoves(): string {
	  let movesString = '';
	  for (let move of this.moves) {
		movesString += this.hashXY(move[0], move[1]) + ' ';
	  }
	  return movesString.trim();
	}
  
	endGame(status: packets.GameStatus, winningHexagons: Array<[number, number]> = []) {
	  this.handler.handlePacket({
			type: packets.ClientBoundPacketType.GAME_END, 
			status: status, 
			moves: this.exportMoves(),
			winningHexagons: winningHexagons 
		} as packets.ClientBoundGameEndPacket);
	}
  
	exportGame(): packets.Game {
	  return {
		game_id: this.game_id,
		game_parameters: this.game_parameters,
		grid: this.grid,
		first_player_id: this.first_player_id,
		second_player_id: this.second_player_id,
		turn: this.turn
	  }
	}
  
	checkForWinnerXY(x: number, y: number) {
	  let hexagonState = this.grid[x][y];
	  if (hexagonState != 1 && hexagonState != 2) {
		console.warn("Check for winner called on hexagon of type " + hexagonState + ".");
		return { winner: false, winningHexagons: [] };
	  }
  
	  let hexagonsToCheck: Array<[number, number]> = [[x, y]];
	  let checkedHexagons: Array<number> = [];
	  let winningHexagons: Array<[number, number]> = [];
	  let lowerBound = false;
	  let higherBound = false;
  
	  while (hexagonsToCheck.length > 0) {
		let hexagon = hexagonsToCheck.pop()!!;
		checkedHexagons.push(this.hashHexagon(hexagon));
		winningHexagons.push(hexagon); // Ajout de l'hexagone à la liste gagnante
  
		let ownSurroundingHexagons = this.filterHexagons(this.getSurroundingHexagons(hexagon[0], hexagon[1]), hexagonState);
  
		for (let ownHexagon of ownSurroundingHexagons) {
		  if (!checkedHexagons.includes(this.hashHexagon(ownHexagon))) {
			hexagonsToCheck.push(ownHexagon);
		  }
		}
  
		if (hexagonState === 1) {
		  if (hexagon[1] === 0) {
			lowerBound = true;
		  }
		  if (hexagon[1] === this.game_parameters.board_size - 1) {
			higherBound = true;
		  }
		} else {
		  if (hexagon[0] === 0) {
			lowerBound = true;
		  }
		  if (hexagon[0] === this.game_parameters.board_size - 1) {
			higherBound = true;
		  }
		}
  
		if (lowerBound && higherBound) {
		  return { winner: true, winningHexagons: winningHexagons };
		}
	  }
  
	  return { winner: false, winningHexagons: [] };
	}
	hashXY(x: number, y: number): number {
	  const size = this.grid.length;
	  return x + y * size
	}
  
	hashHexagon(hexagon: [number, number]): number {
	  return this.hashXY(hexagon[0], hexagon[1])
	}
	getSurroundingHexagons(x: number, y: number) {
	  let surroundingHexagons: Array<[number, number]> = [];
	  if (x > 0) {
		surroundingHexagons.push([x - 1, y]);
	  }
	  if (x < this.game_parameters.board_size - 1) {
		surroundingHexagons.push([x + 1, y]);
	  }
	  if (y > 0) {
		surroundingHexagons.push([x, y - 1]);
	  }
	  if (y < this.game_parameters.board_size - 1) {
		surroundingHexagons.push([x, y + 1]);
	  }
	  if (x > 0 && y < this.game_parameters.board_size - 1) {
		surroundingHexagons.push([x - 1, y + 1]);
	  }
	  if (x < this.game_parameters.board_size - 1 && y > 0) {
		surroundingHexagons.push([x + 1, y - 1]);
	  }
	  return surroundingHexagons;
	}
	filterHexagons(hexagons: Array<[number, number]>, state: number) {
	  let filteredHexagons: Array<[number, number]> = []
	  for (let hexagon of hexagons) {
		if (this.grid[hexagon[0]][hexagon[1]] === state) {
		  filteredHexagons.push(hexagon);
		}
	  }
	  return filteredHexagons
	}
  }


export class OfflineHandler {
	private game: GameInstance
	private callbacks: WebsocketCallbacks;

	constructor(callbacks: WebsocketCallbacks, gameParameters: packets.LocalGameParameters) {
		this.callbacks = callbacks;
		this.game = new GameInstance(this, "offline", gameParameters, "1", "1");
	}

	awaitConnection() {
		return new Promise<OfflineHandler>((resolve, reject) => {
			resolve(this);
		});
	}

	sendPacket(packet: packets.ServerBoundGenericPacket) {
		if (packet.type === packets.ServerBoundPacketType.PLAY_MOVE) {
			const playMovePacket = packet as packets.ServerBoundPlayMovePacket;
			this.game.playMove(playMovePacket.x, playMovePacket.y);
		}
		if (packet.type === packets.ServerBoundPacketType.FORFEIT_GAME) {
			if (this.game.turn % 2 === 0) {
				this.game.endGame(packets.GameStatus.SECOND_PLAYER_WIN);
			}
			else {
				this.game.endGame(packets.GameStatus.FIRST_PLAYER_WIN);
			}
		}
		if (packet.type === packets.ServerBoundPacketType.JOIN_GAME) {
			this.callbacks.joinGameCallback(this.game.exportGame());
		}
	}

	handlePacket(packet: packets.ClientBoundGenericPacket) {
		switch (packet.type) {
			case packets.ClientBoundPacketType.ERROR_MESSAGE:
				this.callbacks.errorCallback((packet as packets.ClientBoundErrorMessagePacket).message);
				break;
			case packets.ClientBoundPacketType.GAME_SEARCH:
				const gameSearchPacket = packet as packets.ClientBoundGameSearchPacket;
				this.callbacks.gameSearchCallback(gameSearchPacket.game_parameters, gameSearchPacket.player_count, gameSearchPacket.elo_range);
				break;
			case packets.ClientBoundPacketType.GAME_FOUND:
				this.callbacks.gameFoundCallback((packet as packets.ClientBoundGameFoundPacket).game_id);
				break;
			case packets.ClientBoundPacketType.JOIN_GAME:
				this.callbacks.joinGameCallback((packet as packets.ClientBoundJoinGamePacket).game);
				break;
			case packets.ClientBoundPacketType.MOVE_PLAYED:
				const movePlayedPacket = packet as packets.ClientBoundMovePlayedPacket;
				this.callbacks.movePlayedCallback(movePlayedPacket.x, movePlayedPacket.y, movePlayedPacket.turn, movePlayedPacket.grid_array);
				break;
			case packets.ClientBoundPacketType.GAME_END:
				const gameEndPacket = packet as packets.ClientBoundGameEndPacket;
			 	this.callbacks.gameEndCallback(gameEndPacket.status, gameEndPacket.moves, gameEndPacket.winningHexagons);
			 	break;
		}
	}

}