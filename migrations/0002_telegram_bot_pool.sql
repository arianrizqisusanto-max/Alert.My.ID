-- Migration to support Bot Pool / Sharding
CREATE TABLE IF NOT EXISTS telegram_bots (
  id TEXT PRIMARY KEY,
  bot_username TEXT UNIQUE NOT NULL,
  bot_token TEXT NOT NULL,
  user_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- Add bot reference to users table
ALTER TABLE users ADD COLUMN telegram_bot_id TEXT REFERENCES telegram_bots(id);
