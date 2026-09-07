import { CookieMap, type ServerWebSocket } from 'bun';
import * as jose from 'jose';
import { config } from './config';
import type { UserId } from './types';

export async function authenticateRequest(request: Request): Promise<{ status: number; message: string; userId: UserId | null }> {
  const cookies = new CookieMap(request.headers.get('cookie') ?? '');
  const token = cookies.get('access_token');
  if (!token) return { status: 200, message: 'Success (No Auth)', userId: null };
  try {
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(config.jwtKey));
    if (typeof payload.id !== 'string') return { status: 401, message: 'Failed to authenticate token.', userId: null };
    return { status: 200, message: 'Success', userId: payload.id };
  } catch {
    return { status: 401, message: 'Failed to authenticate token.', userId: null };
  }
}

export function closeSocket(ws: ServerWebSocket<UserId>, reason: string): void {
  ws.close(1008, reason);
}
