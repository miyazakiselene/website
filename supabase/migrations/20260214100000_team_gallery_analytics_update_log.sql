-- チーム紹介画像マニフェスト（Supabase Storage のオブジェクト一覧と説明・初期画像非表示）
-- アクセス解析レポート JSON（ダッシュボード）
-- 更新ログ本文（Markdown）

create table if not exists public.team_gallery_manifest (
  id text primary key,
  manifest jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.team_gallery_manifest is 'manifest は version / updatedAt / images / hiddenDefaultImageIds を持つ JSON。画像バイナリは Storage バケット team-gallery。';

alter table public.team_gallery_manifest enable row level security;

create table if not exists public.analytics_reports_snapshot (
  id text primary key,
  reports jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.analytics_reports_snapshot is 'data/vercel-analytics-reports.json と同形の { reports: [...] } を DB に置くと本番でもダッシュボードが参照可能。';

alter table public.analytics_reports_snapshot enable row level security;

create table if not exists public.site_update_log (
  id text primary key,
  body text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.site_update_log is 'UPDATE_LOG.md に相当する本文。行が無い・空のときはリポジトリの UPDATE_LOG.md にフォールバック。';

alter table public.site_update_log enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-gallery',
  'team-gallery',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do nothing;

drop policy if exists "Allow public read team gallery objects" on storage.objects;

create policy "Allow public read team gallery objects"
on storage.objects for select
to public
using (bucket_id = 'team-gallery');
