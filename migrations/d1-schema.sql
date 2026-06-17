-- D1 SQLite Database Schema for Alert.my.id

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  telegram_chat_id TEXT,
  whatsapp_number TEXT,
  google_refresh_token TEXT,
  google_sync_enabled INTEGER DEFAULT 0, -- 0 = false, 1 = true
  created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- 2. Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  features TEXT NOT NULL -- JSON string of features
);

-- Seed Plans
INSERT OR REPLACE INTO plans (id, name, price, features) VALUES
('free_trial', 'Free Trial', 0.00, '{"telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true}'),
('basic', 'Basic Plan', 12.00, '{"telegram": true, "whatsapp": false, "unlimited_reminders": true, "history": true, "support": "priority"}'),
('whatsapp_pro', 'WhatsApp Pro', 36.00, '{"telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true, "support": "priority", "multiple_alerts": true, "priority_delivery": true}');

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
  stripe_subscription_id TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- 4. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reminder_date TEXT NOT NULL, -- YYYY-MM-DD
  reminder_time TEXT NOT NULL, -- HH:MM
  timezone TEXT NOT NULL,
  notification_channels TEXT NOT NULL, -- Comma-separated list (e.g. "telegram,whatsapp")
  recurring_type TEXT NOT NULL CHECK (recurring_type IN ('one_time', 'daily', 'weekly', 'monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  google_event_id TEXT,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_status_date_time ON reminders (status, reminder_date, reminder_time);

-- 5. Reminder Logs Table
CREATE TABLE IF NOT EXISTS reminder_logs (
  id TEXT PRIMARY KEY,
  reminder_id TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')) NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('telegram', 'whatsapp')),
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE
);
