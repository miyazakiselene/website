import "server-only"

import { normalizeTournamentRecords, type TournamentRecord } from "@/lib/staff-records"
import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "staff_results_snapshot"
const PRIMARY_ID = "primary"

export function isStaffResultsSupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

function parseRecordsCell(raw: unknown): TournamentRecord[] | null {
  if (raw === null || raw === undefined) return null
  if (!Array.isArray(raw)) return null
  return normalizeTournamentRecords(raw as TournamentRecord[])
}

/**
 * DB に保存済みの JSON 配列が無いときは null（呼び出し側でファイルにフォールバック）。
 */
export async function readStaffResultsSnapshotFromSupabase(): Promise<TournamentRecord[] | null> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).select("records").eq("id", PRIMARY_ID).maybeSingle()

  if (error) throw error
  if (data == null) return null
  return parseRecordsCell(data.records)
}

export async function writeStaffResultsSnapshotToSupabase(records: TournamentRecord[]): Promise<void> {
  const normalized = normalizeTournamentRecords(records)
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from(TABLE).upsert(
    {
      id: PRIMARY_ID,
      records: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) throw error
}
