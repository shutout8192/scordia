import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'toeic.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS review_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_json TEXT NOT NULL,
      wrong_count INTEGER DEFAULT 1,
      interval_days INTEGER DEFAULT 1,
      next_review_at TEXT NOT NULL,
      last_seen_at TEXT,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      questions_attempted INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS question_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pexels_id TEXT NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      question_json TEXT NOT NULL,
      quality_checked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
