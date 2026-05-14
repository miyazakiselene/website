import "server-only"

import {
  dedupeActivitiesByIdFirstWins,
  normalizeActivityRecord,
  sortActivitiesNewestFirst,
  type ActivityRecord,
} from "@/lib/activities-model"
import { ACTIVITIES_MAX_ITEMS } from "@/lib/activities-validation"
import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "activity_records"

export function isActivitiesSupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

type ActivityRow = {
  id: string
  start_date: string
  end_date: string
  title: string
  location: string
  content: string
  opponent: string
}

function finalizeRecords(raw: ActivityRecord[]): ActivityRecord[] {
  return dedupeActivitiesByIdFirstWins(raw)
}

function rowToInput(row: ActivityRow) {
  return {
    id: row.id,
    startDate: String(row.start_date).slice(0, 10),
    endDate: String(row.end_date).slice(0, 10),
    title: row.title,
    location: row.location ?? "",
    content: row.content ?? "",
    opponent: row.opponent,
  }
}

export async function readActivitiesFromSupabase(): Promise<ActivityRecord[]> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,start_date,end_date,title,location,content,opponent")
    .order("end_date", { ascending: false })
    .order("start_date", { ascending: false })
    .order("id", { ascending: false })

  if (error) throw error

  const items = (data ?? [] as ActivityRow[])
    .map((r) => normalizeActivityRecord(rowToInput(r)))
    .filter((v): v is ActivityRecord => v !== null)

  return sortActivitiesNewestFirst(finalizeRecords(items))
}

export async function appendActivityRecordSupabase(record: ActivityRecord): Promise<ActivityRecord[]> {
  const normalized = normalizeActivityRecord(record)
  if (normalized === null) {
    throw new Error("ACTIVITIES_INVALID")
  }

  const existing = await readActivitiesFromSupabase()
  if (existing.length >= ACTIVITIES_MAX_ITEMS) {
    throw new Error(`ACTIVITIES_LIMIT: 活動記録は最大 ${ACTIVITIES_MAX_ITEMS} 件までです。`)
  }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from(TABLE).insert({
    id: normalized.id,
    start_date: normalized.startDate,
    end_date: normalized.endDate,
    title: normalized.title,
    location: normalized.location,
    content: normalized.content,
    opponent: normalized.opponent,
  })

  if (error) {
    if (error.code === "23505") {
      throw new Error("ACTIVITIES_DUPLICATE_ID")
    }
    throw error
  }

  return readActivitiesFromSupabase()
}

export async function updateActivityRecordSupabase(record: ActivityRecord): Promise<ActivityRecord[]> {
  const normalized = normalizeActivityRecord(record)
  if (normalized === null) {
    throw new Error("ACTIVITIES_INVALID")
  }

  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      start_date: normalized.startDate,
      end_date: normalized.endDate,
      title: normalized.title,
      location: normalized.location,
      content: normalized.content,
      opponent: normalized.opponent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalized.id)
    .select("id")

  if (error) throw error
  if (data == null || data.length === 0) {
    throw new Error("ACTIVITIES_NOT_FOUND")
  }

  return readActivitiesFromSupabase()
}

export async function deleteActivityRecordByIdSupabase(id: string): Promise<ActivityRecord[]> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id")

  if (error) throw error
  if (data == null || data.length === 0) {
    throw new Error("ACTIVITIES_NOT_FOUND")
  }

  return readActivitiesFromSupabase()
}
