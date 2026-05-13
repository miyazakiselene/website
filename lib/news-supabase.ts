import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { dedupeNewsRecordsByIdFirstWins, normalizeNewsRecord, type NewsRecord } from "@/lib/news-model"
import { NEWS_MAX_ITEMS } from "@/lib/news-validation"

const TABLE = "news_items"

export function isNewsSupabaseEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error("Supabase が未設定です。NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。")
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type NewsItemRow = {
  id: string
  title: string
  venue: string
  content: string | null
  event_start_date: string
  event_end_date: string
}

function rowToInput(row: NewsItemRow) {
  return {
    id: row.id,
    title: row.title,
    venue: row.venue,
    content: row.content ?? undefined,
    eventStartDate: String(row.event_start_date).slice(0, 10),
    eventEndDate: String(row.event_end_date).slice(0, 10),
  }
}

function finalizeRecords(raw: NewsRecord[]): NewsRecord[] {
  return dedupeNewsRecordsByIdFirstWins(raw)
}

export async function readNewsFromSupabase(): Promise<NewsRecord[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,title,venue,content,event_start_date,event_end_date")
    .order("event_start_date", { ascending: true })
    .order("id", { ascending: true })

  if (error) throw error

  const items = (data ?? [] as NewsItemRow[])
    .map((r) => normalizeNewsRecord(rowToInput(r)))
    .filter((v): v is NewsRecord => v !== null)

  return finalizeRecords(items)
}

export async function appendNewsRecordSupabase(record: NewsRecord): Promise<NewsRecord[]> {
  const normalized = normalizeNewsRecord(record)
  if (normalized === null) {
    throw new Error("NEWS_INVALID")
  }

  const existing = await readNewsFromSupabase()
  if (existing.length >= NEWS_MAX_ITEMS) {
    throw new Error(`NEWS_LIMIT: お知らせは最大 ${NEWS_MAX_ITEMS} 件までです。`)
  }

  const supabase = getAdminClient()
  const { error } = await supabase.from(TABLE).insert({
    id: normalized.id,
    title: normalized.title,
    venue: normalized.venue,
    content: normalized.content ?? null,
    event_start_date: normalized.eventStartDate,
    event_end_date: normalized.eventEndDate,
  })

  if (error) {
    if (error.code === "23505") {
      throw new Error("NEWS_DUPLICATE_ID")
    }
    throw error
  }

  return readNewsFromSupabase()
}

export async function updateNewsRecordSupabase(record: NewsRecord): Promise<NewsRecord[]> {
  const normalized = normalizeNewsRecord(record)
  if (normalized === null) {
    throw new Error("NEWS_INVALID")
  }

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      title: normalized.title,
      venue: normalized.venue,
      content: normalized.content ?? null,
      event_start_date: normalized.eventStartDate,
      event_end_date: normalized.eventEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalized.id)
    .select("id")

  if (error) throw error
  if (data == null || data.length === 0) {
    throw new Error("NEWS_NOT_FOUND")
  }

  return readNewsFromSupabase()
}

export async function deleteNewsRecordByIdSupabase(id: string): Promise<NewsRecord[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id")

  if (error) throw error
  if (data == null || data.length === 0) {
    throw new Error("NEWS_NOT_FOUND")
  }

  return readNewsFromSupabase()
}
