import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { usersRouter } from './routes/users';
import { gamesRouter } from './routes/games';
import { config } from './config';

export const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
  origin: config.corsOrigin ? config.corsOrigin.split(',').map(origin => origin.trim()) : true,
  credentials: true,
  exposedHeaders: ['access_token', 'refresh_token', 'username'],
}));
app.use(cookieParser());
app.use(usersRouter);
app.use(gamesRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.end();
});
