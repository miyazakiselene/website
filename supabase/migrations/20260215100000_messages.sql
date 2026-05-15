-- 応援メッセージ保存テーブル
-- Supabase Dashboard → SQL Editor でこのファイルを実行するか、CLI でマイグレーションしてください。

create table if not exists public.messages (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null    default now(),
  nickname   text        not null,
  content    text        not null    check (char_length(content) <= 100),
  is_approved boolean    not null    default false
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

-- anon / authenticated は直接アクセス不可。
-- service_role は RLS をバイパスするため、すべての操作を API ルート経由で実施する。
