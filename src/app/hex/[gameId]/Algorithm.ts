import { GridHash, RawScoredGameInstance, RawSimpleGameInstance, RawScore, Coordinate } from "../../definitions";


export class SimpleGameInstance { // TODO Ajouter un check pour victoire
	public grid: Array<Array<number>>;
	public moves: Array<Coordinate>;
	public turn: number;
	

	constructor(grid: Array<Array<number>>, turn: number, moves: Array<Coordinate> = []) {
		this.grid = grid;
		this.turn = turn;
		this.moves = moves;
	}

	getValidMoves() {
		const validMoves: Array<Coordinate> = [];
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				if (this.isValidMove(i, j)) {
					validMoves.push([i, j]);
				}
			}
		}
		return validMoves;
	}

	isValidMove(y: number, x: number) {
		return this.grid[y][x] === 0;
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

	playMoveYX(y: number, x: number) {
		if (this.isValidMove(y, x)) {
			let newGrid = this.grid.map(row => row.slice()); // Crée une copie de la grille
			newGrid[y][x] = this.getCurrentPlayer();
			let newMoves = this.moves.slice(); // Crée une copie des mouvements
			newMoves.push([y, x]);
			let newTurn = this.turn + 1; // Incrémente le tour
			return new SimpleGameInstance(newGrid, newTurn, newMoves); // Retourne une nouvelle instance de jeu avec la grille mise à jour
		} else {
			throw new Error("Invalid move");
		}
	}

	playMove(coord: Coordinate) {
		this.playMoveYX(coord[0], coord[1]);
	}

	// Assigne un score à une partie
	// et retourne une nouvelle instance de la partie avec le score mis à jour
	giveInitialScore(score: Score) {
		return new ScoredGameInstance(this.grid, this.turn, score);
	}

	raw(): RawSimpleGameInstance {
		return {
			grid: this.grid,
			turn: this.turn,
			moves: this.moves
		}
	}

	static fromRaw(raw: RawSimpleGameInstance): SimpleGameInstance {
		return new SimpleGameInstance(raw.grid, raw.turn, raw.moves);
	}
}

// Le joueur 1 (rouge) souhaite un score positif
// Le joueur 2 (bleu) souhaite un score négatif
// À un tour impair, le joueur 1 joue
// À un tour pair, le joueur 2 joue
// Donc, l'instance de jeu prend le score minimum des instances suivantes pour le joueur 2
// et le score maximum pour le joueur 1
export class ScoredGameInstance extends SimpleGameInstance {
	public score: Score;
	public previousInstances: Array<ScoredGameInstance> = [];
	public nextInstances: Map<number, ScoredGameInstance> = new Map<number, ScoredGameInstance>();

	constructor(grid: Array<Array<number>>, turn: number, score: Score) {
		super(grid, turn);
		this.score = score;
	}

	getScore() {
		return this.score;
	}

	setScore(score: Score) {
		this.score = score;
	}
	
	updatePreviousInstances() {
		for (const instance of this.previousInstances) {
			instance.updateScore();
		}
	}

	updateScore() {
		let minMax = this.turn % 2 === 0 ? Score.min : Score.max; // Choix de la fonction min ou max en fonction du tour
		let scores = this.nextInstances.values().map(instance => instance.getScore()).toArray();
		this.score = minMax(scores);
		this.updatePreviousInstances();
	}
	raw(): RawScoredGameInstance {
		return {
			grid: this.grid,
			turn: this.turn,
			moves: this.moves,
			score: this.score.raw(),
			nextInstances: new Map<number, GridHash>() // Potentiellement coûteux alors que non utilisé
		}
	}
 
	static fromRaw(raw: RawScoredGameInstance): ScoredGameInstance {
		return new ScoredGameInstance(raw.grid, raw.turn, Score.fromRaw(raw.score));
	}
}
interface RecommendatedMove {
	x: number;
	y: number;
	score: number;
	optimalRoute: Array<Coordinate>;	
}
export class Explorer {
	private game: ScoredGameInstance;
	private currentPlayer: number;
	private heuristic: Function;
	private updateCallback: Function;
	private workers: Array<Worker>;
	private instancesToExplore: Array<ScoredGameInstance> = []; // Liste des instances à explorer
	
	constructor(game: SimpleGameInstance, heurstic: Function, updateCallback: Function) {
		this.game = this.rateInstance(game); 
		this.currentPlayer = game.getCurrentPlayer();
		this.heuristic = heurstic;
		this.updateCallback = updateCallback;
		this.workers = [];
		for (let i = 0; i < navigator.hardwareConcurrency; i++) {
			this.workers.push(new Worker(new URL("../../../../public/workers/AlgorithmWorker.js", import.meta.url))); // Crée un worker pour chaque coeur du processeur	
		}
		this.instancesToExplore.push(this.game); // Ajoute l'instance de jeu initiale à la liste des instances à explorer
		this.loop();
	}

	loop() {

	}

	rateInstance(instance: SimpleGameInstance): ScoredGameInstance {
		return new ScoredGameInstance(instance.getGrid(), instance.getTurn(), this.heuristic(instance));
	}
}

type CheckableHexagon = [Coordinate, number, number]; // [[y, x], cout, nombre de ponts]

export function basicHeuristic(instance: SimpleGameInstance): Score {
	let grid = instance.getGrid();
	let player1Score = attributeScore(grid, 1); // On calcule le score du joueur 1
	let player2Score = attributeScore(grid, 2); // On calcule le score du joueur 2
	if (player1Score[0] === 0) {
		if (player1Score[1] === 0) { // Le joueur a gagné
			return new Score(0.5, true); // Si le joueur 1 a gagné, on retourne 0.5
		}
		return new Score(player1Score[1], true); // Si le joueur 1 a un pont assuré, il gagne
	}
	if (player2Score[0] === 0) {
		if (player2Score[1] === 0) { // Le joueur a gagné
			return new Score(-0.5, true); // Si le joueur 2 a gagné, on retourne -0.5
		}
		return new Score(-player2Score[1], true); // Si le joueur 2 a un pont assuré, il gagne
	}
	return new Score(player1Score[0] - player2Score[0], false); // Sinon, on retourne la différence de score entre les deux joueurs
	
}


function attributeScore(grid: number[][], player: number): [number, number] {
	let size = grid.length;
	let minCost = grid.length ** 2; // Valeur inatteignable pour le cout
	let minBridges = grid.length ** 2; // Valeur inatteignable pour le nombre de ponts
	let boundCheck;
	let hexagonsToCheck: Array<CheckableHexagon> = [];
	let checkedHexagons: Array<Coordinate> = [];
	if (player === 1) {
		for (let i = 0; i < grid.length; i++) {
			if (grid[i][0] === 1) {
				hexagonsToCheck.push([[i, 0], 0, 0]);
			}
			else if (grid[i][0] === 0) {
				if (i > 0 && grid[i - 1][1] === 1) {
					hexagonsToCheck.push([[i, 0], 0, 1]);
				} else if (grid[i][1] === 1) {
					hexagonsToCheck.push([[i, 0], 0, 1]);
				} else {
					hexagonsToCheck.push([[i, 0], 1, 0]);
				}
			}
		}
	}
	else {
		for (let i = 0; i < grid.length; i++) {
			if (grid[0][i] === 2) {
				hexagonsToCheck.push([[0, i], 0, 0]);
			}
			else if (grid[0][i] === 0) {
				if (i > 0 && grid[1][i - 1] === 2) {
					hexagonsToCheck.push([[0, i], 0, 1]);
				} else if (grid[1][i] === 2) {
					hexagonsToCheck.push([[0, i], 0, 1]);
				} else {
					hexagonsToCheck.push([[0, i], 1, 0]);
				}
			}
		}
	}

	while (hexagonsToCheck.length > 0) {
		hexagonsToCheck.sort((a, b) => b[1] - a[1]); // Trie les hexagones par coût décroissant
		let hexagon = hexagonsToCheck.pop()!!;
		checkedHexagons.push(hexagon[0]); // Ajoute l'hexagone à la liste des hexagones vérifiés
		let surroundingHexagons = getSurroundingHexagons(grid.length, hexagon[0][0], hexagon[0][1]);
		let freeHexagons = filterAntiHexagons(grid, surroundingHexagons, 3 - player); // Filtre les hexagones environnants pour ne garder que ceux du joueur actuel
		for (let surroundingHexagon of freeHexagons) {
			if (!isCoordinateInArray(checkedHexagons, surroundingHexagon)) {
				let cost;
				let isBridge = false;
				boundCheck = player === 1 ? surroundingHexagon[1] : surroundingHexagon[0];
				if (grid[surroundingHexagon[0]][surroundingHexagon[1]] === player) { // Si la case suivante est occupée par le joueur actuel alors pas d'ajout de cout
					cost = hexagon[1];
				} else if (grid[hexagon[0][0]][hexagon[0][1]] === player) { // Si la case précédente est occupée par le joueur actuel, alors on étudie pour un pont
					if (boundCheck === size - 1) { // Si la case suivante est sur la dernière colonne, on a un pont assuré
						cost = hexagon[1];
						isBridge = true;
					} else {
						let candidates = getOuterBridgeHexagons(hexagon[0], surroundingHexagon).filter(coord => isInBounds(size, coord)).filter(coord => grid[coord[0]][coord[1]] === player); // On cherche les hexagones extérieurs formant un potientiel pont
						if (candidates.length > 0) { 
							candidates = candidates.filter(coord => getInnerBridgeHexagons(hexagon[0], surroundingHexagon).every(coord2 => grid[coord2[0]][coord2[1]])); // On vérifie si les hexagones intérieurs sont libres
							if (candidates.length > 0) {
								cost = hexagon[1]; // Si on a un pont, on ne change pas le cout
								isBridge = true;
							} else {
								cost = hexagon[1] + 1;
							}
						} else {
							cost = hexagon[1] + 1;
						}
					}
				} else {
					cost = hexagon[1] + 1; // Si la case précédente n'est pas occupée par le joueur actuel, on ajoute 1 au cout
				}
				let bridges = isBridge ? hexagon[2] + 1 : hexagon[2];
				if (boundCheck === size - 1) {
					if (cost === 0) {
						if (bridges < minBridges) {
							minBridges = bridges;
							minCost = 0;
							hexagonsToCheck = hexagonsToCheck.filter(hex => hex[1] === 0 && hex[2] < bridges); // On retire les hexagones à vérifier qui utilisent déjà autant ou plus de ponts que le minimum trouvé					
						}
					}
					else if (cost < minCost) {
						minCost = cost;
						hexagonsToCheck = hexagonsToCheck.filter(hex => hex[1] < cost); // On retire les hexagones à vérifier qui ont un cout supérieur (ou égal) au minimum trouvé
					}
				} else {
					let existingHexagons = hexagonsToCheck.filter(hex => hex[0][0] === surroundingHexagon[0] && hex[0][1] === surroundingHexagon[1]);
					if (existingHexagons.length > 0) {
						if (existingHexagons[0][1] > cost) {
							existingHexagons[0][1] = cost; // Met à jour le cout de l'hexagone si le nouveau cout est plus faible
							existingHexagons[0][2] = bridges
						} else if (existingHexagons[0][1] === cost && existingHexagons[0][2] > hexagon[2]) {
							existingHexagons[0][2] = bridges
						} 
					} else {
						hexagonsToCheck.push([surroundingHexagon, cost, bridges]); // Ajoute l'hexagone à la liste des hexagones à vérifier
					}
				}
			}
		}
	}
	return [minCost, minBridges]; // Retourne le cout et le nombre de ponts minimums trouvés
}

function isCoordinateInArray(array: Array<Coordinate>, coord: Coordinate) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] === coord[0] && array[i][1] === coord[1]) {
            return true;
        }
    }
    return false;
}

function getInnerBridgeHexagons(hex1: Coordinate, hex2: Coordinate): Array<Coordinate> { 
	let diffY = hex2[0] - hex1[0];
	let diffX = hex2[1] - hex1[1];
	let y = hex2[0];
	let x = hex2[1];
	//console.log(x, y, hex2[0], hex2[1], diffX, diffY)
	if (diffX === 1 && diffY === 1) {
		return [[y, x - 1], [y - 1, x]];
	}
	if (diffX === -1 && diffY === 2) {
		return [[y - 1, x], [y - 1, x + 1]];
	}
	if (diffX === -2 && diffY === 1) {
		return [[y - 1, x + 1], [y, x + 1]];
	}
	if (diffX === -1 && diffY === -1) {
		return [[y, x + 1], [y + 1, x]];
	}
	if (diffX === 1 && diffY === -2) {
		return [[y + 1, x], [y + 1, x - 1]];
	}
	if (diffX === 2 && diffY === -1) {
		return [[y + 1, x - 1], [y, x - 1]];
	}
	
	console.warn("Invalid hexagons for inner bridge hexagons.");
	return [];
}


function getOuterBridgeHexagons(outer: Coordinate, inner: Coordinate): Array<Coordinate> {
	let diffY = outer[0] - inner[0]
	let diffX = outer[1] - inner[1];
	let y = outer[0];
	let x = outer[1];
	if (diffX === 1 && diffY === 0) {
		return [[y + 1, x - 2], [y - 1, x - 1]];
	}
	if (diffX === 0 && diffY === 1) {
		return [[y - 1, x - 1], [y - 2, x + 1]];
	}
	if (diffX === -1 && diffY === 1) {
		return [[y - 2, x + 1], [y - 1, x + 2]];
	}
	if (diffX === -1 && diffY === 0) {
		return [[y - 1, x + 2], [y + 1, x + 1]];
	}
	if (diffX === 0 && diffY === -1) {
		return [[y + 1, x + 1], [y + 2, x - 1]];
	}
	if (diffX === 1 && diffY === -1) {
		return [[y + 2, x - 1], [y + 1, x - 2]];
	}
	console.error("Invalid hexagons for outer bridge hexagons.", [outer, inner]);
	return [];
}

function filterHexagons(grid: Array<Array<number>>, hexagons: Array<Coordinate>, state: number) {
	let filteredHexagons = []
	for (let hexagon of hexagons) {
		if (grid[hexagon[0]][hexagon[1]] === state) {
			filteredHexagons.push(hexagon);
		}
	}
	return filteredHexagons
}
function filterAntiHexagons(grid: Array<Array<number>>, hexagons: Array<Coordinate>, state: number) {
	let filteredHexagons = []
	for (let hexagon of hexagons) {
		if (grid[hexagon[0]][hexagon[1]] != state) {
			filteredHexagons.push(hexagon);
		}
	}
	return filteredHexagons
}

function getSurroundingHexagons(size: number, y: number, x: number) : Array<Coordinate> {
	let surroundingHexagons: Array<Coordinate> = [];
	if (x > 0) {
		surroundingHexagons.push([y, x - 1]);
	}
	if (x < size - 1) {
		surroundingHexagons.push([y, x + 1]);
	}
	if (y > 0) {
		surroundingHexagons.push([y - 1, x]);
	}
	if (y < size - 1) {
		surroundingHexagons.push([y + 1, x]);
	}
	if (x > 0 && y < size - 1) {
		surroundingHexagons.push([y + 1, x - 1]);
	}
	if (x < size - 1 && y > 0) {
		surroundingHexagons.push([y - 1, x + 1]);
	}
	return surroundingHexagons;
}

function isInBounds(size: number, hexagon: Coordinate) {
	return isInBoundsYX(size, hexagon[0], hexagon[1]);
}

function isInBoundsYX(size: number, y: number, x: number) {
	return y >= 0 && y < size && x >= 0 && x < size;
}

export function hashYX(length: number, y: number, x: number): number {
	const size = length;
	return y + x * size
  }

export class Score {
	public score: number;
	public isWinCountdown: boolean; // true si le score est un nombre de coups avant la victoire

	constructor(score: number, isWinCountdown: boolean) {
		this.score = score;
		this.isWinCountdown = isWinCountdown;
	}

	toString() {
		return this.isWinCountdown ? `#${Math.round(this.score)}` : `${this.score}`;
	}

	public isBiggerThan(other: Score): boolean { // Comparaison de scores qui prend en compte les scores assurant la victoire après X coups
		if (!this.isWinCountdown && !other.isWinCountdown) { // Si les deux scores n'assurent pas une victoire, comparaison classique
			return this.score > other.score;
		}
		if (this.isWinCountdown && !other.isWinCountdown) { // Si l'un des deux scores assure une victoire, on regarde uniquement son signe puisque ce score se trouve en dehors des bornes de scores classiques
			return this.score > 0;
		}
		if (!this.isWinCountdown && other.isWinCountdown) {
			return other.score < 0;
		}
	 	if (this.score * other.score < 0) { // Si on a deux scores assurant une victoire de signes opposés, alors le signe positif est toujours le plus grand
			return this.score > other.score;
		}
		return Math.abs(this.score) < Math.abs(other.score); // Si les deux scores assurant une victoire sont de signes identiques, celui qui est le plus proche de 0 est le plus grand
	}

	public isSmallerThan(other: Score): boolean {
		return other.isBiggerThan(this);
	}

	raw(): RawScore {
		return {
			score: this.score,
			isWinCountdown: this.isWinCountdown
		}
	}

	static fromRaw(raw: RawScore): Score {
		return new Score(raw.score, raw.isWinCountdown);
	}

	static min(values: Array<Score>): Score {
		return values.reduce((a, b) => a.isSmallerThan(b) ? a : b);
	}

	static max(values: Array<Score>): Score {
		return values.reduce((a, b) => a.isBiggerThan(b) ? a : b);
	}
}

export function hashGrid(grid: Array<Array<number>>): GridHash {
	let hash = "";
	for (let i of grid) {
		for (let j of i) {
			hash += j
		}
	}
	return hash;
}

