import "server-only"

import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

/**
 * 表示コンテンツを持つ各テーブルと、その「最終更新時刻」を表す列。
 * 関係者専用ページ（Supabase）から文章・データを編集すると、これらの時刻が更新される。
 */
const CONTENT_TABLES: ReadonlyArray<{ table: string; column: string }> = [
  { table: "news_items", column: "updated_at" },
  { table: "activity_records", column: "updated_at" },
  { table: "staff_results_snapshot", column: "updated_at" },
  { table: "team_gallery_manifest", column: "updated_at" },
  { table: "site_update_log", column: "updated_at" },
  { table: "messages", column: "created_at" },
]

async function readLatestTimestamp(table: string, column: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .order(column, { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return null
    if (data == null) return null
    const value = (data as unknown as Record<string, unknown>)[column]
    return typeof value === "string" && value.trim().length > 0 ? value : null
  } catch {
    return null
  }
}

/**
 * Supabase 上の表示コンテンツの「最終更新時刻」（ISO 文字列）を返す。
 * Supabase 未設定、またはどのテーブルからも取得できない場合は null。
 * DB を日付を変えずに編集したケースも、ここで拾えるようにするためのもの。
 */
export async function readLatestSupabaseContentUpdatedAt(): Promise<string | null> {
  if (!isSupabaseServiceConfigured()) return null

  const results = await Promise.all(
    CONTENT_TABLES.map(({ table, column }) => readLatestTimestamp(table, column)),
  )

  let latest: string | null = null
  for (const ts of results) {
    if (ts == null) continue
    const t = Date.parse(ts)
    if (Number.isNaN(t)) continue
    if (latest == null || t > Date.parse(latest)) {
      latest = ts
    }
  }
  return latest
}
