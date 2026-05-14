import "server-only"

import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "analytics_reports_snapshot"
const PRIMARY_ID = "primary"

export function isAnalyticsReportsSupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

/**
 * DB に行が無い・reports が null のときは null（呼び出し側で JSON ファイルにフォールバック）。
 */
export async function readAnalyticsReportsPayloadFromSupabase(): Promise<unknown[] | null> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).select("reports").eq("id", PRIMARY_ID).maybeSingle()

  if (error) throw error
  if (data == null) return null
  const raw = data.reports
  if (raw == null) return null
  if (!Array.isArray(raw)) return null
  return raw
}
