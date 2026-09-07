import { Router } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db';
import { verifyGameServerAuth } from '../middleware/auth';
import { GameStatus, type Game, type GameHistoryRow, type User } from '../types';
import { eloAlgo, getRandomUniqueID, jsonValue } from '../utils';

export const gamesRouter = Router();

gamesRouter.post('/get_game/:id', async (req, res, next) => {
  try {
    const result = await pool.query<Game>(
      'SELECT game_id AS "gameId", game_parameters AS "gameParameters", first_player_id AS "firstPlayerId", second_player_id AS "secondPlayerId", status, game_date::double precision AS "gameDate", moves FROM games WHERE game_id = $1',
      [req.params.id],
    );
    res.send(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

gamesRouter.post('/create_game', verifyGameServerAuth, async (req, res, next) => {
  try {
    const { firstPlayerId, secondPlayerId, gameParameters } = req.body;
    const gameId = getRandomUniqueID();
    await pool.query(
      'INSERT INTO games (game_id, game_parameters, first_player_id, second_player_id, status, game_date) VALUES ($1, $2, $3, $4, $5, $6)',
      [gameId, jsonValue(gameParameters), firstPlayerId, secondPlayerId, GameStatus.IN_PROGRESS, Date.now()],
    );
    res.send({ gameId });
  } catch (err) {
    next(err);
  }
});

gamesRouter.post('/end_game', verifyGameServerAuth, async (req, res, next) => {
  let client: PoolClient | undefined;
  try {
    const { gameId, status, moves, firstPlayerId, secondPlayerId } = req.body;
    client = await pool.connect();
    await client.query('BEGIN');

    const playersResult = await client.query<User>(
      'SELECT id, mmr, password, username, registration_date::double precision AS registration_date FROM users WHERE id IN ($1, $2) FOR UPDATE',
      [firstPlayerId, secondPlayerId],
    );
    const player1 = playersResult.rows.find(player => player.id === firstPlayerId);
    const player2 = playersResult.rows.find(player => player.id === secondPlayerId);
    if (!player1 || !player2) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    const gameResult = await client.query<Game>(
      'SELECT game_id AS id, game_id AS "gameId", game_parameters AS "gameParameters", first_player_id AS "firstPlayerId", second_player_id AS "secondPlayerId", status, game_date::double precision AS "gameDate", moves FROM games WHERE game_id = $1 FOR UPDATE',
      [gameId],
    );
    if (!gameResult.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    const oldP1elo = player1.mmr;
    const oldP2elo = player2.mmr;
    let player1Change = 0;
    let player2Change = 0;
    if (status === GameStatus.FIRST_PLAYER_WIN) {
      [player1Change, player2Change] = eloAlgo(oldP1elo, oldP2elo);
    } else if (status === GameStatus.SECOND_PLAYER_WIN) {
      [player2Change, player1Change] = eloAlgo(oldP2elo, oldP1elo);
    }

    await client.query('UPDATE users SET mmr = $1 WHERE id = $2', [oldP1elo + player1Change, player1.id]);
    await client.query('UPDATE users SET mmr = $1 WHERE id = $2', [oldP2elo + player2Change, player2.id]);
    await client.query(
      'UPDATE games SET status = $1, moves = $2, elo_change_first_player = $3, elo_change_second_player = $4 WHERE game_id = $5',
      [status, jsonValue(moves), player1Change, player2Change, gameId],
    );
    await client.query('COMMIT');

    res.send({
      gameId,
      status,
      EloFirstPlayer: { old: oldP1elo, change: player1Change },
      EloSecondPlayer: { old: oldP2elo, change: player2Change },
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => undefined);
    next(err);
  } finally {
    client?.release();
  }
});

gamesRouter.get('/get_games_by_user/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await pool.query<GameHistoryRow>(
      'SELECT game_id AS "gameId", game_date::double precision AS "gameDate", elo_change_first_player AS "EloChangeFirstPlayer", elo_change_second_player AS "EloChangeSecondPlayer", first_player_id AS "firstPlayerId", second_player_id AS "secondPlayerId", moves FROM games WHERE first_player_id = $1 OR second_player_id = $1 ORDER BY game_date DESC',
      [userId],
    );
    const userResult = await pool.query<{ mmr: number }>('SELECT mmr FROM users WHERE id = $1', [userId]);
    let mmr = userResult.rows[0]?.mmr ?? 0;
    const games = result.rows.map(game => ({ ...game }));
    const opponentIds = [...new Set(games.map(game => game.firstPlayerId === userId ? game.secondPlayerId : game.firstPlayerId))];
    const opponents: Record<string, string> = {};

    if (opponentIds.length > 0) {
      const opponentsResult = await pool.query<{ id: string; username: string }>(
        'SELECT id, username FROM users WHERE id = ANY($1::text[])',
        [opponentIds],
      );
      opponentsResult.rows.forEach(user => { opponents[user.id] = user.username; });
    }

    games.forEach(game => {
      let change = 0;
      if (game.firstPlayerId === userId && typeof game.EloChangeFirstPlayer === 'number') {
        change = game.EloChangeFirstPlayer;
        game.opponentId = game.secondPlayerId;
      } else if (game.secondPlayerId === userId && typeof game.EloChangeSecondPlayer === 'number') {
        change = game.EloChangeSecondPlayer;
        game.opponentId = game.firstPlayerId;
      }
      game.mmrAfterGame = mmr;
      mmr -= change;
      game.opponentUsername = game.opponentId ? opponents[game.opponentId] || null : null;
    });
    res.send(games);
  } catch (err) {
    next(err);
  }
});

gamesRouter.delete('/delete_in_progress_games', async (_req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM games WHERE status = $1', [GameStatus.IN_PROGRESS]);
    res.send({ deleted: result.rowCount ?? 0 });
  } catch (err) {
    next(err);
  }
});
