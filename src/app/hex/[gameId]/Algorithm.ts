import { OfflineHandler } from "./OfflineHandler";
import * as packets from "../../definitions";

class SimpleGameInstance {
	protected grid: Array<Array<number>>;
	protected moves: Array<[number, number]>;
	protected turn: number;
	

	constructor(grid: Array<Array<number>>, turn: number, moves: Array<[number, number]> = []) {
		this.grid = grid;
		this.turn = turn;
		this.moves = moves;
	}

	getValidMoves() {
		const validMoves: Array<[number, number]> = [];
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				if (this.isValidMove(i, j)) {
					validMoves.push([i, j]);
				}
			}
		}
	}

	isValidMove(i: number, j: number) {
		return this.grid[i][j] === 0;
	}

	getCurrentPlayer() {
		return this.turn % 2 === 0 ? 2 : 1;
	}

	getGrid() {
		return this.grid;
	}

	getTurn() {
		return this.turn;
	}

	playMoveXY(x: number, y: number) {
		if (this.isValidMove(x, y)) {
			let newGrid = this.grid.map(row => row.slice()); // Crée une copie de la grille
			newGrid[x][y] = this.getCurrentPlayer();
			let newMoves = this.moves.slice(); // Crée une copie des mouvements
			newMoves.push([x, y]);
			let newTurn = this.turn + 1; // Incrémente le tour
			return new SimpleGameInstance(newGrid, newTurn, newMoves); // Retourne une nouvelle instance de jeu avec la grille mise à jour
		} else {
			throw new Error("Invalid move");
		}
	}	

	playMove(coord: [number, number]) {
		this.playMoveXY(coord[0], coord[1]);
	}

	// Assigne un score à une partie
	// et retourne une nouvelle instance de la partie avec le score mis à jour
	giveInitialScore(score: number) {
		return new ScoredGameInstance(this.grid, this.turn, score);
	}
}

// Le joueur 1 (rouge) souhaite un score positif
// Le joueur 2 (bleu) souhaite un score négatif
// À un tour impair, le joueur 1 joue
// À un tour pair, le joueur 2 joue
// Donc, l'instance de jeu prend le score minimum des instances suivantes pour le joueur 2
// et le score maximum pour le joueur 1
class ScoredGameInstance extends SimpleGameInstance {
	protected score: number;
	protected previousInstances: Array<ScoredGameInstance> = [];
	protected nextInstances: Map<number, ScoredGameInstance> = new Map<number, ScoredGameInstance>();

	constructor(grid: Array<Array<number>>, turn: number, score: number) {
		super(grid, turn);
		this.score = score;
	}

	getScore() {
		return this.score;
	}

	setScore(score: number) {
		this.score = score;
	}
	
	updatePreviousInstances() {
		for (const instance of this.previousInstances) {
			instance.updateScore();
		}
	}

	updateScore() {
		let minMax = this.turn % 2 === 0 ? Math.min : Math.max; // Choix de la fonction min ou max en fonction du tour
		let scores = this.nextInstances.values().map(instance => instance.getScore()).toArray();
		this.score = minMax(...scores);
		this.updatePreviousInstances();
	}

}
interface RecommendatedMove {
	x: number;
	y: number;
	score: number;
	optimalRoute: Array<[number, number]>;	
}

export class Explorer {
	private game: SimpleGameInstance;
	private currentPlayer: number;
	private heuristic: Function;
	private updateCallback: Function;

	constructor(game: SimpleGameInstance, heurstic: Function, updateCallback: Function) {
		this.game = game;
		this.currentPlayer = game.getCurrentPlayer();
		this.heuristic = heurstic;
		this.updateCallback = updateCallback;

	}

}

function basicHeuristic(game: SimpleGameInstance): number {
	//heuristique ici
	return 0;
}