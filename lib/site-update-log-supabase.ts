import "server-only"

import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "site_update_log"
const PRIMARY_ID = "primary"

export function isSiteUpdateLogSupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

/** 行が無い・body が null のときは null（ファイルにフォールバック） */
export async function readSiteUpdateLogBodyFromSupabase(): Promise<string | null> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).select("body").eq("id", PRIMARY_ID).maybeSingle()

  if (error) throw error
  if (data == null) return null
  if (typeof data.body !== "string") return null
  return data.body
}
