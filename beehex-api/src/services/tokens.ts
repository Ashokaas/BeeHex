import * as jose from 'jose';
import { config } from '../config';

type TokenUser = { id: string; username: string };

export async function createAccessToken(user: TokenUser): Promise<string> {
  return new jose.SignJWT({ id: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.accessTokenExpiry)
    .sign(config.jwtAccessSecret);
}

export async function createRefreshToken(user: TokenUser): Promise<string> {
  return new jose.SignJWT({ id: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.refreshTokenExpiry)
    .sign(config.jwtRefreshSecret);
}
