import { config } from './config';
import type { GameParameters, ServerBoundPacket } from './types';

export enum ClientBoundPacketType {
  ERROR_MESSAGE = 0,
  GAME_SEARCH = 1,
  GAME_FOUND = 2,
  JOIN_GAME = 3,
  MOVE_PLAYED = 4,
  GAME_END = 5,
}

export enum ServerBoundPacketType {
  GAME_SEARCH = 0,
  CANCEL_GAME_SEARCH = 1,
  JOIN_GAME = 2,
  JOIN_ROOM = 3,
  PLAY_MOVE = 4,
  FORFEIT_GAME = 5,
}

export function isGameParameters(value: unknown): value is GameParameters {
  if (!value || typeof value !== 'object') return false;
  const parameters = value as Partial<GameParameters>;
  return typeof parameters.ranked === 'boolean'
    && typeof parameters.board_size === 'number'
    && config.boardSizes.includes(parameters.board_size)
    ;
}

export function parsePacket(message: string): ServerBoundPacket | null {
  try {
    const packet: unknown = JSON.parse(message);
    if (!packet || typeof packet !== 'object' || !('type' in packet)) return null;
    const type = (packet as { type: unknown }).type;
    if (typeof type !== 'number' || !Number.isInteger(type) || !Object.values(ServerBoundPacketType).includes(type)) return null;
    return packet as ServerBoundPacket;
  } catch {
    return null;
  }
}

export function hasString(packet: ServerBoundPacket, key: string): boolean {
  return typeof packet[key] === 'string';
}

export function hasCoordinates(packet: ServerBoundPacket): boolean {
  return typeof packet.x === 'number' && Number.isInteger(packet.x)
    && typeof packet.y === 'number' && Number.isInteger(packet.y);
}

export function sendPacket(ws: { send(message: string): void }, type: ClientBoundPacketType, payload: Record<string, unknown> = {}): void {
  ws.send(JSON.stringify({ type, ...payload }));
}
