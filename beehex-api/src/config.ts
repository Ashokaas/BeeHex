import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const requiredVars = ['GAMESERVER_KEY', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'POSTGRES_PASSWORD'];
  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`[config] variables manquantes ou vides en production: ${missing.join(', ')}`);
  }
}

export const config = {
  port: Number(process.env.PORT || 3001),
  cookieDomain: process.env.COOKIE_DOMAIN,
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  corsOrigin: process.env.CORS_ORIGIN || '',
  gameServerKey: process.env.GAMESERVER_KEY || '',
  jwtAccessSecret: new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || 'development-access-secret'),
  jwtRefreshSecret: new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'development-refresh-secret'),
  accessTokenExpiry: '180s',
  refreshTokenExpiry: '7d',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'beehex_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
};
