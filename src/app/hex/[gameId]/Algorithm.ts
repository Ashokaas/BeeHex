import { GridHash, RawScoredGameInstance, RawSimpleGameInstance, RawScore, Coordinate, AlgorithmExplorerBoundGenericPacket, AlgorithmExplorerBoundPacketType, AlgorithmExplorerBoundResultPacket, AlgorithmWorkerBoundPacketType, AlgorithmWorkerBoundExplorePacket, AlgorithmWorkerBoundSetIdPacket } from "../../definitions";

var empty_array: number[][] = []
var empty_map: Map<number, ScoredGameInstance> = new Map<number, ScoredGameInstance>()
export class SimpleGameInstance { // TODO Ajouter un check pour victoire
	public grid: number[][];
	public moves: Array<Coordinate>;
	public turn: number;
	protected gridHash: string;

	constructor(grid: Array<Array<number>>, turn: number, moves: Array<Coordinate> = []) {
		this.grid = grid;
		this.turn = turn;
		this.moves = moves;
		this.gridHash = hashGrid(grid); 
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

	getGridHash() {
		return this.gridHash;
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
		return new ScoredGameInstance(this.grid, this.turn, this.moves, score);
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
	public nextInstances: Map<number, ScoredGameInstance>
	public leadingInstance: ScoredGameInstance | null = null; // Instance qui a le meilleur score
	public completedBranch: boolean; // Indique si l'instance a été complètement explorée

	constructor(grid: Array<Array<number>>, turn: number, moves: Array<Coordinate>, score: Score) {
		super(grid, turn);
		this.score = score;
		this.moves = moves.slice()
		if (this.score.isWinCountdown && (this.score.score == 0.5 || this.score.score == -0.5)) {
			this.nextInstances = empty_map
			this.completedBranch = true
		} else {
			this.nextInstances = new Map<number, ScoredGameInstance>();
			this.completedBranch = false
		}
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

	getNextChildToExplore(): ScoredGameInstance {
		if (this.nextInstances.size == 0) {
			return this
		}
		if (this.completedBranch) {
			return this
		}
		const instancesLeft = this.nextInstances.values().toArray().filter(instance => instance.completedBranch == false);
		
		let minMax
		if (this.turn % 2 === 0) {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? b : a
		} else {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? a : b
		}
		let nextInstance = instancesLeft.reduce(minMax);
		return nextInstance.getNextChildToExplore();

	}

	getBestChildInstance(): ScoredGameInstance {
		if (this.nextInstances.size > 0) {
			//console.log(this.getGridHash())
			return this.leadingInstance!!.getBestChildInstance(); // On retourne l'instance avec le meilleur score
		} else return this;
		/*
		if (this.nextInstances.size == 0) {
			return this; // Si l'instance n'a pas d'enfants, on retourne l'instance elle-même
		}
		
		if (this.turn % 2 === 0) {
			for (let nextInstance of this.nextInstances.values().toArray()) {
				if (nextInstance.getTurn() != this.getTurn() + 1) {
					console.error("Order break", nextInstance.getTurn(), this.getTurn())
				}
			}
			const result = this.nextInstances.values().reduce((a, b) => a.getScore().isSmallerThan(b.getScore()) ? a : b).getBestChildrenInstance();
			
			return result // Retourne l'instance avec le score maximum
		} else {
			for (let nextInstance of this.nextInstances.values().toArray()) {
				if (nextInstance.getTurn() != this.getTurn() + 1) {
					console.error("Order break", nextInstance.getTurn(), this.getTurn())
				}
			}
			const result = this.nextInstances.values().reduce((a, b) => a.getScore().isBiggerThan(b.getScore()) ? a : b).getBestChildrenInstance();
			return result // Retourne l'instance avec le score minimum
		}
		*/
	}
	updateScore() {
		if (this.nextInstances.size == 0) {
			console.warn("ScoredGameInstance.updateScore() called on an instance with no children")
		}
		let currentScore = this.score
		let minMax;
		if (this.turn % 2 === 0) {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? b : a
		} else {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? a : b
		}
		const nextInstances = this.nextInstances.values().toArray();
		const leadingInstance = nextInstances.reduce(minMax);
		let leadingScore = leadingInstance.getScore();
		let newScore = Score.fromRaw(leadingScore.raw()); // On doit créer une nouvelle instance de Score, sinon on modifie l'instance de Score d'origine
		
		if (newScore.isWinCountdown) { // Lorsque le score des branches est un nombre de coups avant la victoire, on doit augmenter ce nombre de 0.5, puisque un coup supplémentaire doit être joué
			newScore.score += newScore.score > 0 ? 0.5 : -0.5 // 
		}
		this.grid = empty_array // On vide la grille pour économiser de la mémoire, il ne sert plus à rien de la garder puisque ses enfants existent
		this.completedBranch = leadingInstance.completedBranch
		for (let instance of nextInstances) {
			this.completedBranch = this.completedBranch && instance.completedBranch
		}
		if (!currentScore.isEqualTo(newScore) || this.leadingInstance != leadingInstance || this.completedBranch == true) {
			//console.log("Current turn : " + this.turn + " | Current score : " + currentScore.toString() + " | New score : " + newScore.toString())	
			//console.log("Climb up")
			this.score = newScore;
			this.leadingInstance = leadingInstance
			this.updatePreviousInstances();
		}

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
		return new ScoredGameInstance(raw.grid, raw.turn, raw.moves, Score.fromRaw(raw.score));
	}
}
// Ce type d'instance est spécifique aux plateaux concernant le premier coup dans l'arbre d'exploration, qui est pertinent pour afficher le score de chacun des coups jouables.
// L'instance agit comme une ScoredGameInstance normale, mais ne met pas à jour d'instances précédentes, et envoie son score mis à jour à l'explorateur lorsqu'il doit différer.
// Ce type d'instance ne doit être traité que par le thread principal, et non un Worker, sinon l'instance sera rétrogradée en ScoredGameInstance
class MainScoredGameInstance extends ScoredGameInstance {
	private explorerCallback: Function
	public playedMove: Coordinate
	constructor(grid: Array<Array<number>>, turn: number, moves: Array<Coordinate>, score: Score, playedMove: Coordinate, explorerCallback: Function) {
		super(grid, turn, moves, score);
		this.explorerCallback = explorerCallback
		this.playedMove = playedMove;

	}

	updateScore() {
		if (this.nextInstances.size == 0) {
			console.warn("MainScoredGameInstance.updateScore() called on an instance with no children")
		}
		let currentScore = this.score
		let minMax;
		if (this.turn % 2 === 0) {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? b : a
		} else {
			minMax = (a: ScoredGameInstance, b: ScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? a : b
		}
		const nextInstances = this.nextInstances.values().toArray();
		const leadingInstance = nextInstances.reduce(minMax);
		let leadingScore = leadingInstance.getScore();
		let newScore = Score.fromRaw(leadingScore.raw()); // On doit créer une nouvelle instance de Score, sinon on modifie l'instance de Score d'origine
		
		if (newScore.isWinCountdown) { // Lorsque le score des branches est un nombre de coups avant la victoire, on doit augmenter ce nombre de 0.5, puisque un coup supplémentaire doit être joué
			newScore.score += newScore.score > 0 ? 0.5 : -0.5 // 
		}
		//console.log("MAIN Current turn : " + this.turn + " | Current score : " + currentScore.toString() + " | New score : " + newScore.toString())
		this.completedBranch = leadingInstance.completedBranch

		for (let instance of nextInstances) {
			this.completedBranch = this.completedBranch && instance.completedBranch
		}
		if (this.completedBranch) {
			console.warn("Completed branch" + this.getGridHash())
		}
		if (!currentScore.isEqualTo(newScore) || this.leadingInstance != leadingInstance || this.completedBranch == true) {
			//console.log("CALLBACK")
			this.score = newScore;
			this.leadingInstance = leadingInstance
			this.explorerCallback(this)
		} 
	}

}
export interface RecommendedMove {
	coordinate: Coordinate;
	score: Score;
	optimalRoute: Array<Coordinate>;
}
export class Explorer {
	private game: ScoredGameInstance;
	private heuristic: Function;
	private updateCallback: Function;
	private mainInstances: Array<MainScoredGameInstance>
	private worker: Worker = new Worker(new URL("AlgorithmWorker.ts", import.meta.url));
	//private workers: Array<Worker>;
	private instances: Map<GridHash, ScoredGameInstance>;
	//private instancesToExplore: Map<string, ScoredGameInstance> = []; // Liste des instances à explorer
	//private waitingWorkers: Array<Worker> = []; // Liste des workers en attente d'une instance à explorer$
	private bestMoves: Array<MainScoredGameInstance>;
	constructor(grid: Array<Array<number>>, turn: number, heuristic: Function, updateCallback: Function) {
		let simpleGame = new SimpleGameInstance(grid, turn, []);
		this.worker.addEventListener("message", this._workerCallback.bind(this));
		this.heuristic = heuristic;
		this.updateCallback = updateCallback;
		this.bestMoves = []
		this.game = this.rateInstance(simpleGame);
		this.instances = new Map<GridHash, ScoredGameInstance>();
		this.instances.set(this.game.getGridHash(), this.game);
		if (this.game.getScore().isWinCountdown && (this.game.getScore().score == 0.5 || this.game.getScore().score == -0.5)) {
			this.mainInstances = []
			updateCallback({coordinate: [1, 1], score: this.game.getScore(), optimalRoute: []} as RecommendedMove); // Envoie une version vide de la recommandation
			return
		}
		
		this.mainInstances = this.populateMainInstances(); // Remplit la liste des instances principales à explorer
		this.sendNextInstanceToWorker();
		//this.workers = [];
		/*
		for (let i = 0; i < navigator.hardwareConcurrency - 5; i++) { // "../../public/workers/AlgorithmWorker.js",
			this.workers.push(new Worker(new URL("AlgorithmWorker.ts", import.meta.url))); // Crée un worker pour chaque coeur du processeur
			this.workers[i].addEventListener("message", this._workerCallback.bind(this)); // Ajoute un listener pour chaque worker
			this.workers[i].postMessage({ type: AlgorithmWorkerBoundPacketType.SET_ID, id: i } as AlgorithmWorkerBoundSetIdPacket); // Envoie un message au worker pour lui assigner un id
			this.waitingWorkers.push(this.workers[i]); // Ajoute les workers à la liste des workers en attente d'une instance à explorer
		}
		while (this.waitingWorkers.length > 0 && this.instancesToExplore.length > 0) {
			let awokenWorker = this.waitingWorkers.pop()!!;
			const instance = this.instancesToExplore.pop()!!; // Récupère la dernière instance à explorer
			awokenWorker.postMessage({
				type: AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE,
				game: instance.raw()
			} as AlgorithmWorkerBoundExplorePacket); // Envoie l'instance au worker pour exploration
		}

		*/

		// Ajoute l'instance de jeu initiale à la liste des instances à explorer
	}

	setGame(grid: Array<Array<number>>, turn: number, heuristic: Function, updateCallback: Function) {
		let simpleGame = new SimpleGameInstance(grid, turn, []);
		this.heuristic = heuristic;
		this.updateCallback = updateCallback;
		this.bestMoves = []
		this.game = this.rateInstance(simpleGame);
		this.instances = new Map<GridHash, ScoredGameInstance>();
		this.instances.set(this.game.getGridHash(), this.game);
		if (this.game.getScore().isWinCountdown && (this.game.getScore().score == 0.5 || this.game.getScore().score == -0.5)) {
			this.mainInstances = []
			updateCallback({coordinate: [1, 1], score: this.game.getScore(), optimalRoute: []} as RecommendedMove); // Envoie une version vide de la recommandation
			return
		}
		
		this.mainInstances = this.populateMainInstances(); // Remplit la liste des instances principales à explorer
		this.sendNextInstanceToWorker();
	}

	mainInstanceCallback(mainInstance: MainScoredGameInstance) {
		if (!this.bestMoves.includes(mainInstance)) {
			this.bestMoves.push(mainInstance)
		}
		let minMaxFunction;
		if (this.game.turn % 2 === 0) {
			//console.log("Min")
			minMaxFunction = (a: MainScoredGameInstance, b: MainScoredGameInstance) => a.getScore().isBiggerThan(b.getScore()) ? 1 : -1
		} else {
			//console.log("Max")
			minMaxFunction = (a: MainScoredGameInstance, b: MainScoredGameInstance) => a.getScore().isSmallerThan(b.getScore()) ? 1 : -1
		}
		this.bestMoves.sort(minMaxFunction)
		if (this.bestMoves.length <= 10) {
			//console.log("Best scores : [" + this.bestMoves.map(move => move.score.toString()).join(", ") + "]")
			const recommendedMoves = this.bestMoves.map(move => {return {coordinate: move.playedMove, score: move.getScore(), optimalRoute: move.getBestChildInstance().moves} as RecommendedMove})
			this.updateCallback(recommendedMoves); // Envoie le coup joué et le score à la fonction de mise à jour
			return
		}
		this.bestMoves.pop()
		//console.log("Best scores : [" + this.bestMoves.map(move => move.score.toString()).join(", ") + "]")
		const recommendedMoves = this.bestMoves.map(move => {return {coordinate: move.playedMove, score: move.getScore(), optimalRoute: move.getBestChildInstance().moves} as RecommendedMove})
		this.updateCallback(recommendedMoves); // Envoie le coup joué et le score à la fonction de mise à jour
	}

	populateMainInstances() {
		let nextInstances = explore(this.game);
		let nextMainInstances = new Map<number, MainScoredGameInstance>();
		for (let moveHash of nextInstances.keys().toArray()) {
			let nextInstance = nextInstances.get(moveHash)!
			let nextMainInstance = new MainScoredGameInstance(nextInstance.getGrid(), nextInstance.getTurn(), nextInstance.moves, nextInstance.getScore(), nextInstance.moves[0], this.mainInstanceCallback.bind(this)); // Crée une instance de jeu principale pour chaque instance suivante
			nextMainInstances.set(moveHash, nextMainInstance)
			this.instances.set(nextMainInstance.getGridHash(), nextMainInstance)
			if (nextMainInstance.getScore().isWinCountdown == true && (nextMainInstance.getScore().score == 0.5 || nextMainInstance.getScore().score == -0.5)) {
				this.mainInstanceCallback(nextMainInstance)
				continue
			}
			let furtherInstances = explore(nextMainInstance)
			for (let moveHash of furtherInstances.keys().toArray()) {
				let furtherInstance = furtherInstances.get(moveHash)!!
				this.instances.set(furtherInstance.getGridHash(), furtherInstance);
				nextMainInstance.nextInstances.set(moveHash, furtherInstance)
			}
			nextMainInstance.updateScore(); // Met à jour le score de l'instance principale
		}
		return nextMainInstances.values().toArray()


	}

	sendNextInstanceToWorker() {
		if (this.game.turn % 2 == 0) {
			this.mainInstances.sort((a, b) => a.getScore().isSmallerThan(b.getScore()) ? -1 : 1); // Trie les instances principales par score décroissant
		} else {
			this.mainInstances.sort((a, b) => a.getScore().isBiggerThan(b.getScore()) ? -1 : 1); // Trie les instances principales par score croissant
		}
		let allWinCountdowns;
		for (let i = 0; i < this.mainInstances.length && i < 25; i++) {
			if (this.mainInstances[i].getScore().isWinCountdown == false) {
				allWinCountdowns = false;
				break;
			}
			allWinCountdowns = true;
		}
		for (let i = 0; i < this.mainInstances.length; i++) {
			//console.log("Pass " + i + " | " + this.mainInstances[i].getScore().toString())
			let mainInstance = this.mainInstances[i];
			if (mainInstance.getScore().isWinCountdown && !allWinCountdowns) {
				continue
			}
			let bestInstance = mainInstance.getNextChildToExplore(); // Récupère l'instance avec le meilleur score
			if (!bestInstance.completedBranch) {
				//console.log("Send " + bestInstance.getGridHash() + " | " + bestInstance.getScore().toString())
				this.worker.postMessage({
					id: this.game.getGridHash(),
					type: AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE,
					game: bestInstance.raw()
				} as AlgorithmWorkerBoundExplorePacket); // Envoie l'instance au worker pour exploration
				return; // On sort de la boucle une fois qu'on a trouvé une instance à explorer
			}
		}
		console.log("Finished exploration")
		console.log(this.bestMoves)
	}

	public terminate() {
		this.worker.removeEventListener("message", this._workerCallback.bind(this)); // Retire le listener du worker
		this.worker.terminate(); // Termine le worker
	}
	
	private _workerCallback(event: MessageEvent) {
		const packet = event.data as AlgorithmExplorerBoundGenericPacket;
		if (packet.type === AlgorithmExplorerBoundPacketType.RESULT) {

			const packet = event.data as AlgorithmExplorerBoundResultPacket;
			const id = packet.id;
			if (id != this.game.getGridHash()) {
				return
			}
			//const worker = this.workers[id];
			const gameInstances = packet.result.gameInstances;
			for (const hash of gameInstances.keys().toArray()) {
				if (!this.instances.has(hash)) {
					const instance = ScoredGameInstance.fromRaw(gameInstances.get(hash)!!);
					this.instances.set(hash, instance);
				} 
			}
			for (const hash of gameInstances.keys().toArray()) {
				const instance = this.instances.get(hash)!!;
				const rawInstance = gameInstances.get(hash)!!;
				for (const moveHash of rawInstance.nextInstances.keys().toArray()) {
					const nextInstanceHash = rawInstance.nextInstances.get(moveHash)!!;
					const nextInstance = this.instances.get(nextInstanceHash)!!;
					instance.nextInstances.set(moveHash, nextInstance);
					if (!nextInstance.previousInstances.includes(instance)) {
						nextInstance.previousInstances.push(instance); // Ajoute l'instance actuelle à la liste des instances précédentes de l'instance suivante
					}
									
				}
				if (instance.nextInstances.size > 0) {
					instance.updateScore(); // Met à jour le score de l'instance actuelle
				}
			}
			this.sendNextInstanceToWorker()
			/*
			for (const leaveHash of leaves) {
				const instance = this.instances.get(leaveHash)!!;
				if (!this.instancesToExplore.includes(instance) && instance.getTurn() < 26*) {
					this.instancesToExplore.push(instance); // Ajoute l'instance à la liste des instances à explorer
				}
			}
			if (this.instancesToExplore.length > 0) {
				if (this.game.getTurn() % 2 == 0) {
					this.instancesToExplore.sort((a, b) => a.getScore().isBiggerThan(b.getScore()) ? -1 : 1);
				} else {
					this.instancesToExplore.sort((a, b) => a.getScore().isBiggerThan(b.getScore()) ? 1 : -1);
				}
				const instance = this.instancesToExplore.pop()!!; // Récupère la dernière instance à explorer
				worker.postMessage({
					type: AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE,
					game: instance.raw()
				} as AlgorithmWorkerBoundExplorePacket); // Envoie l'instance au worker pour exploration
				while (this.waitingWorkers.length > 0 && this.instancesToExplore.length > 0) {
					let awokenWorker = this.waitingWorkers.pop()!!;
					const instance = this.instancesToExplore.pop()!!; // Récupère la dernière instance à explorer
					awokenWorker.postMessage({
						type: AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE,
						game: instance.raw()
					} as AlgorithmWorkerBoundExplorePacket); // Envoie l'instance au worker pour exploration
				}
			}
			
			else {
				this.waitingWorkers.push(worker); // Ajoute le worker à la liste des workers en attente d'une instance à explorer
			}
			*/
		}

	}

	rateInstance(instance: SimpleGameInstance): ScoredGameInstance {
		return new ScoredGameInstance(instance.getGrid(), instance.getTurn(), instance.moves, this.heuristic(instance));
	}
}

type CheckableHexagon = [Coordinate, number, number]; // [[y, x], cout, nombre de ponts]

export function basicHeuristic(instance: SimpleGameInstance): Score {
	let grid = instance.getGrid();
	let player1Score = attributeScore(grid, 1); // On calcule le score du joueur 1
	let player2Score = attributeScore(grid, 2); // On calcule le score du joueur 2
	//console.log(`minCost|minBridge1: ${player1Score[0]}|${player1Score[1]}, J2: ${player2Score[0]}|${player2Score[1]}, turn: ${instance.getTurn()}, grid: ${grid.join("|")}`)
	if (player1Score[0] === 0) {
		return new Score(player1Score[1] + (instance.getTurn() % 2 === 0 ? 0.5 : 0), true)
	}
	else if (player2Score[0] === 0) {
		return new Score(-player2Score[1] + (instance.getTurn() % 2 === 1 ? -0.5 : 0), true)
	}
	return new Score(player2Score[0] - player1Score[0], false); // Sinon, on retourne la différence de score entre les deux joueurs
}

function explore(game: ScoredGameInstance) {
	const gridLength = game.getGrid().length;
	const playableMoves = game.getValidMoves();
	const nextInstances = new Map<number, ScoredGameInstance>();
	for (let move of playableMoves) {
		const newGame = game.playMoveYX(move[0], move[1]);
		const scoredNewGame = newGame.giveInitialScore(basicHeuristic(newGame));
		nextInstances.set(hashYX(gridLength, move[0], move[1]), scoredNewGame);
		scoredNewGame.previousInstances.push(game); // Ajoute l'instance actuelle à la liste des instances précédentes de l'instance suivante
	}
	return nextInstances;
}

export function attributeScore(grid: number[][], player: number): [number, number] {
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
				if (i > 0 && grid[i - 1][1] === 1 && grid[i - 1][0] === 0) {
					hexagonsToCheck.push([[i, 0], 0, 1]);
				} else if (i < grid.length - 1 && grid[i][1] === 1 && grid[i + 1][0] === 0) {
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
				if (i > 0 && grid[1][i - 1] === 2 && grid[0][i - 1] === 0) {
					hexagonsToCheck.push([[0, i], 0, 1]);
				} else if (i < grid.length - 1 && grid[1][i] === 2 && grid[0][i + 1] === 0) {
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
							candidates = candidates.filter(coord => getInnerBridgeHexagons(hexagon[0], coord).every(coord2 => grid[coord2[0]][coord2[1]] === 0)); // On vérifie si les hexagones intérieurs sont libres
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
				if (boundCheck === size - 1) {// Il existe une erreur de logique, des cases d'arrivée sont considérées comme des ponts, mais elles ne le sont pas
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

function getSurroundingHexagons(size: number, y: number, x: number): Array<Coordinate> {
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

	public isEqualTo(other: Score): boolean {
		return this.score === other.score && this.isWinCountdown === other.isWinCountdown;
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

export function hashGrid(grid: Array<Array<number>>): GridHash { // passer ceci à du base 36
	let hash = 0n
	let ii = 1n
	for (let i of grid) {
	for (let j of i) {
		hash += BigInt(j) * ii
		ii *= 3n
	} 
	}
	let finalHash = hash.toString(36)
	return finalHash 
}
