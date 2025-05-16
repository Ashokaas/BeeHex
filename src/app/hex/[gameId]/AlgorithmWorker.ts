import { AlgorithmExplorerBoundGenericPacket, AlgorithmExplorerBoundPacketType, AlgorithmExplorerBoundResultPacket, AlgorithmWorkerBoundExplorePacket, AlgorithmWorkerBoundGenericPacket, AlgorithmWorkerBoundPacketType, AlgorithmWorkerBoundSetIdPacket, ExploreResult, GridHash, RawScoredGameInstance } from "@/app/definitions";
import { basicHeuristic, hashGrid, hashYX, Score, ScoredGameInstance } from "./Algorithm";
// Objectif du worker : explorer deux niveaux de profondeur et attribuer des scores aux instances
// 

var id = -1;
self.addEventListener("message", (event) => {
	let packet = event.data as AlgorithmWorkerBoundGenericPacket;
	if (packet.type === AlgorithmWorkerBoundPacketType.EXPLORE_INSTANCE) {
		const packet = event.data as AlgorithmWorkerBoundExplorePacket;
		const game = ScoredGameInstance.fromRaw(packet.game);
		//console.log(id.toString() + " | received " + game.getGridHash() + " | " + game.getGridHash())
		const resultMap = new Map<GridHash, RawScoredGameInstance>();
		const leaves: Array<GridHash> = [];
		let currentExploration: Array<ScoredGameInstance> = [];
		let nextInstances = explore(game);
		let rawInitialGame = game.raw()
		let initialGameHash = game.getGridHash()
		resultMap.set(initialGameHash, rawInitialGame);
		for (let moveHash of nextInstances.keys().toArray()) {
			let nextInstance = nextInstances.get(moveHash)!
			let nextGridHash = nextInstance.getGridHash()
			let rawNextInstance = nextInstance.raw()
			rawInitialGame.nextInstances.set(moveHash, nextGridHash);
			resultMap.set(nextGridHash, rawNextInstance);
			let nextScore = nextInstance.getScore()
			if (nextScore.isWinCountdown == false || (nextScore.score != 0.5 && nextScore.score != -0.5)) {
				currentExploration.push(nextInstance);
			}
		}
		for (let currentGame of currentExploration) {
			let rawCurrentGame = resultMap.get(currentGame.getGridHash())!
			let nextInstances = explore(currentGame);
			for (let moveHash of nextInstances.keys().toArray()) {
				let nextInstance = nextInstances.get(moveHash)!
				let nextGridHash = nextInstance.getGridHash()
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
			id: id,
			result: {
				gameInstances: resultMap,
				leaves: leaves
			} as ExploreResult
		} as AlgorithmExplorerBoundResultPacket)
		return;
	}
	if (packet.type === AlgorithmWorkerBoundPacketType.SET_ID) {
		id = (event.data as AlgorithmWorkerBoundSetIdPacket).id;
		return;
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