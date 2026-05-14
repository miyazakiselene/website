-- 試合結果（大会・各試合・動画 URL 含む）を JSON スナップショットで保存（お知らせ・活動記録と同じプロジェクトで利用）

create table if not exists public.staff_results_snapshot (
  id text primary key,
  records jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.staff_results_snapshot is 'records が null の間はサーバー側で data/staff-records.json にフォールバック。初回 PUT で JSON が入る。';

alter table public.staff_results_snapshot enable row level security;
