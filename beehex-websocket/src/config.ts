import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

if (process.env.NODE_ENV === 'production') {
  if (!process.env.GAMESERVER_KEY) {
    throw new Error('[config] GAMESERVER_KEY est requise en production');
  }
  if (!process.env.JWT_KEY && !process.env.JWT_ACCESS_SECRET) {
    throw new Error('[config] JWT_KEY (ou JWT_ACCESS_SECRET) est requise en production');
  }
}

export const config = {
  port: Number(process.env.WEBSOCKET_PORT || process.env.PORT || 3002),
  apiHost: process.env.API_HOST || 'localhost',
  apiPort: Number(process.env.API_PORT || 3001),
  apiProtocol: process.env.API_PROTOCOL || 'http',
  databaseAddress: process.env.DATABASE_ADDRESS
    || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${Number(process.env.API_PORT || 3001)}`,
  jwtKey: process.env.JWT_KEY || process.env.JWT_ACCESS_SECRET || 'development-access-secret',
  gameServerKey: process.env.GAMESERVER_KEY || '',
  heartbeatInterval: 4000,
  heartbeatTimeout: 10000,
  boardSizes: [5, 7, 9, 11, 13],
};
