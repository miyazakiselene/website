-- お知らせを Supabase に保存するためのテーブル
-- Supabase Dashboard → SQL Editor でこのファイルを実行するか、CLI でマイグレーションしてください。

create table if not exists public.news_items (
  id text primary key,
  title text not null,
  venue text not null default '詳細未定',
  content text,
  event_start_date date not null,
  event_end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_items_event_start_date_idx on public.news_items (event_start_date);
create index if not exists news_items_event_end_date_idx on public.news_items (event_end_date);

alter table public.news_items enable row level security;

-- service_role は RLS をバイパスするため、ポリシーなしでサーバーからのみアクセス可能。
-- （anon / authenticated からは行が見えない）
