import getEnv from "@/env/env";
import * as packets from "../../definitions";

interface WebsocketCallbacks {
	errorCallback: (message: string) => void;
	gameSearchCallback: (game_parameters: packets.GameParameters, player_count: number, elo_range: [number, number]) => void;
	gameFoundCallback: (game_id: packets.GameId) => void;
	joinGameCallback: (game: packets.Game) => void;
	movePlayedCallback: (x: number, y: number, turn: number, grid_array: Array<Array<number>>) => void;
	gameEndCallback: (status: packets.GameStatus, moves: string) => void;
	connectionEndedCallback: () => void;
}

export class WebsocketHandler {
	private socket: WebSocket;
	private callbacks: WebsocketCallbacks;

	constructor(callbacks: WebsocketCallbacks) {
		this.callbacks = callbacks;
		this.socket = new WebSocket(`wss://${getEnv()['WEBSOCKET_IP']}/`);
		this.socket.onopen = () => {
			
		};
		this.socket.onmessage = (e) => {
			const packet = JSON.parse(e.data) as packets.ClientBoundGenericPacket;
			this.handlePacket(packet);
		};
		this.socket.onclose = () => {
			
			this.callbacks.connectionEndedCallback();
		};
		this.socket.onerror = (e) => {
			console.error(e);
		}
	}

	awaitConnection() {
		return new Promise<WebsocketHandler>((resolve, reject) => {
			this.socket.onopen = () => {
				resolve(this);
			};
			this.socket.onerror = (e) => {
				reject(e);
			}
		});
	}

	sendPacket(packet: packets.ServerBoundGenericPacket) {
		this.socket.send(JSON.stringify(packet));
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
			 	this.callbacks.gameEndCallback(gameEndPacket.status, gameEndPacket.moves);
			 	break;
		}
	}

}