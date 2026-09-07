import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool(config.postgres);

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      mmr INTEGER NOT NULL DEFAULT 1000,
      registration_date BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS games (
      game_id TEXT PRIMARY KEY,
      game_parameters JSONB,
      first_player_id TEXT NOT NULL,
      second_player_id TEXT NOT NULL,
      status INTEGER NOT NULL,
      game_date BIGINT NOT NULL,
      moves JSONB,
      elo_change_first_player INTEGER,
      elo_change_second_player INTEGER
    );
    CREATE INDEX IF NOT EXISTS games_first_player_id_idx ON games (first_player_id);
    CREATE INDEX IF NOT EXISTS games_second_player_id_idx ON games (second_player_id);
    CREATE INDEX IF NOT EXISTS games_status_idx ON games (status);
    UPDATE games
    SET game_parameters = game_parameters - 'time_limit'
    WHERE game_parameters ? 'time_limit';
  `);
}
