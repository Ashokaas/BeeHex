import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { pool } from '../db';
import { clearTokens, provideNewTokens, verifyToken } from '../middleware/auth';
import type { PublicUser, User } from '../types';
import { getRandomUniqueID } from '../utils';

export const usersRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

usersRouter.get('/get_all_users', async (req, res, next) => {
  try {
    const hasPaging = req.query.first !== undefined && req.query.limit !== undefined;
    if (hasPaging) {
      const first = parseInt(req.query.first as string, 10);
      const limit = parseInt(req.query.limit as string, 10);
      const countResult = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
      const pageResult = await pool.query<PublicUser>(
        'SELECT id, username, mmr, registration_date::double precision AS registration_date FROM users ORDER BY mmr DESC OFFSET $1 LIMIT $2',
        [first, limit],
      );
      res.json({ rows: pageResult.rows, total: Number(countResult.rows[0]?.count ?? 0) });
      return;
    }

    const result = await pool.query<PublicUser>(
      'SELECT id, username, mmr, registration_date::double precision AS registration_date FROM users ORDER BY mmr DESC',
    );
    res.json({ rows: result.rows });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/get_user/:id', async (req, res, next) => {
  try {
    const result = await pool.query<PublicUser>(
      'SELECT id, username, mmr, registration_date::double precision AS registration_date FROM users WHERE id = $1',
      [req.params.id],
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
      res.status(400).json({ message: 'Missing username or password' });
      return;
    }

    const user: User = {
      id: getRandomUniqueID(),
      username,
      password: bcrypt.hashSync(password, 10),
      mmr: 1000,
      registration_date: Date.now(),
    };
    const created = await pool.query<User>(
      'INSERT INTO users (id, username, password, mmr, registration_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, password, mmr, registration_date',
      [user.id, user.username, user.password, user.mmr, user.registration_date],
    );
    const createdUser = created.rows[0]!;
    const publicUser: PublicUser = {
      id: createdUser.id,
      username: createdUser.username,
      mmr: createdUser.mmr,
      registration_date: createdUser.registration_date,
    };
    await provideNewTokens(res, user.id, user.username);
    res.json({ user: publicUser });
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
      res.status(400).json({ message: 'Missing username or password' });
      return;
    }

    const result = await pool.query<User>(
      'SELECT id, username, password, mmr, registration_date::double precision AS registration_date FROM users WHERE username = $1',
      [username],
    );
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const publicUser: PublicUser = {
      id: user.id,
      username: user.username,
      mmr: user.mmr,
      registration_date: user.registration_date,
    };
    await provideNewTokens(res, user.id, user.username);
    res.json({ user: publicUser });
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/edit_password', authLimiter, verifyToken, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body as { current_password: string; new_password: string };
    const result = await pool.query<User>(
      'SELECT id, username, password, mmr, registration_date::double precision AS registration_date FROM users WHERE id = $1',
      [req.userId],
    );
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(current_password, user.password)) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [bcrypt.hashSync(new_password, 10), user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/me', verifyToken, async (req, res, next) => {
  try {
    const result = await pool.query<PublicUser>(
      'SELECT id, username, mmr, registration_date::double precision AS registration_date FROM users WHERE id = $1',
      [req.userId],
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/logout', (_req, res) => {
  clearTokens(res);
  res.json({ message: 'Logged out' });
});
