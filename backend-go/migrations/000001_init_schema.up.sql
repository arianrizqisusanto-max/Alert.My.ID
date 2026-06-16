-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  avatar text,
  telegram_chat_id text,
  whatsapp_number text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  features jsonb NOT NULL
);

-- Seed Plans
INSERT INTO public.plans (id, name, price, features) VALUES
('free_trial', 'Free Trial', 0.00, '{"telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true}'),
('basic', 'Basic Plan', 12.00, '{"telegram": true, "whatsapp": false, "unlimited_reminders": true, "history": true, "support": "priority"}'),
('whatsapp_pro', 'WhatsApp Pro', 36.00, '{"telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true, "support": "priority", "multiple_alerts": true, "priority_delivery": true}')
ON CONFLICT (id) DO UPDATE SET name = excluded.name, price = excluded.price, features = excluded.features;

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.plans(id) NOT NULL,
  start_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status text NOT NULL CHECK (status in ('active', 'trialing', 'past_due', 'canceled')),
  stripe_subscription_id text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  reminder_date date NOT NULL,
  reminder_time time NOT NULL,
  timezone text NOT NULL,
  notification_channels text[] NOT NULL,
  recurring_type text NOT NULL CHECK (recurring_type in ('one_time', 'daily', 'weekly', 'monthly', 'yearly')),
  status text NOT NULL CHECK (status in ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_cron ON public.reminders (status, reminder_date, reminder_time);

-- 5. Reminder Logs Table (Partitioned by Range on sent_at)
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id uuid DEFAULT gen_random_uuid(),
  reminder_id uuid NOT NULL,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  channel text NOT NULL CHECK (channel in ('telegram', 'whatsapp')),
  delivery_status text NOT NULL CHECK (delivery_status in ('pending', 'sent', 'failed')),
  error_message text,
  PRIMARY KEY (id, sent_at)
) PARTITION BY RANGE (sent_at);

-- Partition Tables for 2026
CREATE TABLE IF NOT EXISTS public.reminder_logs_y2026m06 PARTITION OF public.reminder_logs
  FOR VALUES FROM ('2026-06-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.reminder_logs_y2026m07 PARTITION OF public.reminder_logs
  FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.reminder_logs_y2026m08 PARTITION OF public.reminder_logs
  FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');

-- Default Partition for fallback
CREATE TABLE IF NOT EXISTS public.reminder_logs_default PARTITION OF public.reminder_logs DEFAULT;
