-- 応援メッセージに「サイト掲載への同意」フラグを追加
-- 投稿者本人がチェックした場合のみ true。false の場合は関係者内のみの共有とする。
-- Supabase Dashboard → SQL Editor でこのファイルを実行するか、CLI でマイグレーションしてください。

alter table public.messages
  add column if not exists consent_to_publish boolean not null default false;
