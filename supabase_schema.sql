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
