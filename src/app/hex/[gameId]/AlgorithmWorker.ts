import { AlgorithmExplorerBoundGenericPacket, AlgorithmExplorerBoundPacketType, AlgorithmExplorerBoundResultPacket, AlgorithmWorkerBoundExplorePacket, AlgorithmWorkerBoundGenericPacket, AlgorithmWorkerBoundPacketType, ExploreResult, GridHash, RawScoredGameInstance } from "@/app/definitions";
import { basicHeuristic, hashGrid, hashYX, Score, ScoredGameInstance } from "./Algorithm";
// Objectif du worker : explorer deux niveaux de profondeur et attribuer des scores aux instances
// 
self.addEventListener("message", (event) => {
	let packet = event.data as AlgorithmWorkerBoundGenericPacket;
	if (packet.type === AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE) {
		const packet = event.data as AlgorithmWorkerBoundExplorePacket;
		const game = ScoredGameInstance.fromRaw(packet.game);
		const resultMap = new Map<GridHash, RawScoredGameInstance>();
		const leaves: Array<GridHash> = [];
		let currentExploration: Array<ScoredGameInstance> = [];
		let nextInstances = explore(game);
		let rawInitialGame = game.raw()
		let initialGameHash = hashGrid(game.getGrid())
		resultMap.set(initialGameHash, rawInitialGame);
		for (let moveHash of nextInstances.keys().toArray()) {
			let nextInstance = nextInstances.get(moveHash)!
			let nextGridHash = hashGrid(nextInstance.getGrid())
			let rawNextInstance = nextInstance.raw()
			rawInitialGame.nextInstances.set(moveHash, nextGridHash);
			resultMap.set(nextGridHash, rawNextInstance);
			let nextScore = nextInstance.getScore()
			if (nextScore.isWinCountdown == false || (nextScore.score != 0.5 && nextScore.score != -0.5)) {
				currentExploration.push(nextInstance);
			}
		}
		for (let currentGame of currentExploration) {
			let rawCurrentGame = resultMap.get(hashGrid(currentGame.getGrid()))!
			let nextInstances = explore(currentGame);

			for (let moveHash of nextInstances.keys().toArray()) {
				let nextInstance = nextInstances.get(moveHash)!
				let nextGridHash = hashGrid(nextInstance.getGrid())
				let rawNextInstance = nextInstance.raw()
				resultMap.set(nextGridHash, rawNextInstance);
				rawCurrentGame.nextInstances.set(moveHash, nextGridHash);
				let nextScore = nextInstance.getScore()
				if (nextScore.isWinCountdown == false || (nextScore.score != 0.5 && nextScore.score != -0.5)) {
					leaves.push(nextGridHash);
				}

			}

		}
		postMessage({
			type: AlgorithmExplorerBoundPacketType.RESULT,
			result: {
				gameInstances: resultMap,
				leaves: leaves
			} as ExploreResult
		} as AlgorithmExplorerBoundResultPacket)

	}
})

function explore(game: ScoredGameInstance) {
	const gridLength = game.getGrid().length;
	const playableMoves = game.getValidMoves();
	const nextInstances = new Map<number, ScoredGameInstance>();
	for (let move of playableMoves) {
		const newGame = game.playMoveYX(move[0], move[1]);
		const scoredNewGame = newGame.giveInitialScore(basicHeuristic(newGame));
		nextInstances.set(hashYX(gridLength, move[0], move[1]), scoredNewGame);
	}
	return nextInstances;
}