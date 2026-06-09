-- GrindOn 数据库 Schema
-- 在 Supabase SQL Editor 中运行此文件

-- 习惯表
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default '⭐',
  color text not null default '#6366f1',
  created_at timestamptz default now() not null
);

-- 打卡记录表
create table check_ins (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  checked_date date not null,
  created_at timestamptz default now() not null,
  unique(habit_id, checked_date)
);

-- 开启 Row Level Security
alter table habits enable row level security;
alter table check_ins enable row level security;

-- 习惯表 RLS 策略（用户只能操作自己的数据）
create policy "Users can view own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users can insert own habits" on habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update own habits" on habits
  for update using (auth.uid() = user_id);

create policy "Users can delete own habits" on habits
  for delete using (auth.uid() = user_id);

-- 打卡记录表 RLS 策略
create policy "Users can view own check_ins" on check_ins
  for select using (auth.uid() = user_id);

create policy "Users can insert own check_ins" on check_ins
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own check_ins" on check_ins
  for delete using (auth.uid() = user_id);

-- 笔记表
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default '',
  content text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table notes enable row level security;

create policy "Users can view own notes" on notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on notes
  for delete using (auth.uid() = user_id);

create or replace function update_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row execute function update_notes_updated_at();

-- 财务交易表（收支双记：财产 = Σincome − Σexpense）
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  note text not null default '',
  currency text not null default 'SGD',
  occurred_at date not null default current_date,
  created_at timestamptz default now() not null
);

alter table transactions enable row level security;

create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

create index transactions_user_date_idx on transactions (user_id, occurred_at desc);

-- 个人作品表
create table works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default '',
  description text not null default '',
  link text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz default now() not null
);

alter table works enable row level security;

create policy "Users can view own works" on works
  for select using (auth.uid() = user_id);

create policy "Users can insert own works" on works
  for insert with check (auth.uid() = user_id);

create policy "Users can update own works" on works
  for update using (auth.uid() = user_id);

create policy "Users can delete own works" on works
  for delete using (auth.uid() = user_id);

create index works_user_created_idx on works (user_id, created_at desc);
