import type { NextFunction, Request, Response } from 'express';
import * as jose from 'jose';
import { config } from '../config';
import { createAccessToken, createRefreshToken } from '../services/tokens';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function clearTokens(res: Response): void {
  const options = {
    maxAge: 1,
    httpOnly: false,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' as const : 'lax' as const,
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
    path: '/',
  };
  res.cookie('access_token', '', options);
  res.cookie('refresh_token', '', options);
  res.cookie('username', '', options);
  res.cookie('userId', '', options);
}

export async function provideNewTokens(res: Response, userId: string, username: string): Promise<void> {
  const accessToken = await createAccessToken({ id: userId, username });
  const refreshToken = await createRefreshToken({ id: userId, username });
  const options = {
    httpOnly: true,
    path: '/',
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' as const : 'lax' as const,
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
  };
  res.cookie('access_token', accessToken, options);
  res.cookie('refresh_token', refreshToken, options);
  res.cookie('username', username, { ...options, httpOnly: false });
  res.cookie('userId', userId, { ...options, httpOnly: false });
}

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const accessToken = req.cookies['access_token'];
  const refreshToken = req.cookies['refresh_token'];
  try {
    const { payload } = await jose.jwtVerify(accessToken, config.jwtAccessSecret);
    if (!payload.id || !payload.username) throw new Error('Invalid token payload');
    req.userId = String(payload.id);
    next();
  } catch {
    try {
      const { payload } = await jose.jwtVerify(refreshToken, config.jwtRefreshSecret);
      if (!payload.id || !payload.username) throw new Error('Invalid token payload');
      const userId = String(payload.id);
      await provideNewTokens(res, userId, String(payload.username));
      req.userId = userId;
      next();
    } catch {
      clearTokens(res);
      res.status(401).json({ message: 'Invalid refresh token.' });
    }
  }
}

export function verifyGameServerAuth(req: Request, res: Response, next: NextFunction): void {
  const raw = req.headers['authorization'];
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;
  if (token !== config.gameServerKey) {
    res.status(403).json({ message: 'Forbidden.' });
    return;
  }
  next();
}
