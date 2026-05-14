-- 活動記録を Supabase に保存するためのテーブル（お知らせと同じ Supabase プロジェクトで利用）

create table if not exists public.activity_records (
  id text primary key,
  start_date date not null,
  end_date date not null,
  title text not null,
  location text not null default '',
  content text not null default '',
  opponent text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_records_end_date_idx on public.activity_records (end_date desc);
create index if not exists activity_records_start_date_idx on public.activity_records (start_date desc);

alter table public.activity_records enable row level security;
