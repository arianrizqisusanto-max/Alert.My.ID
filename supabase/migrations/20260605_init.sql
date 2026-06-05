-- Supabase Database Migration
-- Alert.my.id Schema Initialization

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (extends Supabase Auth metadata)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar text,
  telegram_chat_id text,
  whatsapp_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for public.users
create policy "Allow users to read their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Allow users to update their own data"
  on public.users for update
  using (auth.uid() = id);

-- 2. Plans Table
create table public.plans (
  id text primary key, -- 'free_trial', 'basic', 'whatsapp_pro'
  name text not null,
  price numeric not null,
  features jsonb not null
);

-- Plans table is readable by everyone
alter table public.plans enable row level security;
create policy "Plans are publicly viewable"
  on public.plans for select
  using (true);

-- Seed Plans
insert into public.plans (id, name, price, features) values
('free_trial', 'Free Trial', 0.00, '{"email": true, "telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true}'),
('basic', 'Basic Plan', 12.00, '{"email": true, "telegram": true, "whatsapp": false, "unlimited_reminders": true, "history": true, "support": "priority"}'),
('whatsapp_pro', 'WhatsApp Pro', 36.00, '{"email": true, "telegram": true, "whatsapp": true, "unlimited_reminders": true, "history": true, "support": "priority", "multiple_alerts": true, "priority_delivery": true}')
on conflict (id) do update set name = excluded.name, price = excluded.price, features = excluded.features;

-- 3. Subscriptions Table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_id text references public.plans(id) not null,
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled')),
  stripe_subscription_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

create policy "Allow users to view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 4. Reminders Table
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text,
  reminder_date date not null,
  reminder_time time not null,
  timezone text not null, -- e.g., 'Asia/Jakarta', 'America/New_York'
  notification_channels text[] not null, -- e.g., ['email', 'telegram']
  recurring_type text not null check (recurring_type in ('one_time', 'daily', 'weekly', 'monthly', 'yearly')),
  status text not null check (status in ('active', 'completed', 'cancelled')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reminders
alter table public.reminders enable row level security;

create policy "Allow users to perform CRUD on their own reminders"
  on public.reminders for all
  using (auth.uid() = user_id);

-- Index for cron scheduler queries (speed up checks)
create index idx_reminders_cron on public.reminders (status, reminder_date, reminder_time);

-- 5. ReminderLogs Table
create table public.reminder_logs (
  id uuid default gen_random_uuid() primary key,
  reminder_id uuid references public.reminders(id) on delete cascade not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  channel text not null check (channel in ('email', 'telegram', 'whatsapp')),
  delivery_status text not null check (delivery_status in ('pending', 'sent', 'failed')),
  error_message text
);

-- Enable RLS on reminder logs
alter table public.reminder_logs enable row level security;

create policy "Allow users to view their own reminder logs"
  on public.reminder_logs for select
  using (
    exists (
      select 1 from public.reminders r
      where r.id = reminder_logs.reminder_id
      and r.user_id = auth.uid()
    )
  );

-- Trigger for syncing new auth users to public.users and creating a 30-day Free Trial subscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Create free trial subscription
  insert into public.subscriptions (user_id, plan_id, start_date, end_date, status)
  values (
    new.id,
    'free_trial',
    now(),
    now() + interval '30 days',
    'trialing'
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
