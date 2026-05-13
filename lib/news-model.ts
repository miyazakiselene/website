import { addDays, isBefore, isValid, parseISO, startOfDay } from "date-fns"
import { NEWS_CONTENT_MAX, NEWS_TITLE_MAX, NEWS_VENUE_MAX } from "@/lib/news-validation"

export type NewsRecord = {
  id: string
  /** 画面上の日付表記 */
  date: string
  title: string
  venue: string
  /** 本文（任意） */
  content?: string
  /**
   * イベント最終日（YYYY-MM-DD）。
   * 試合当日を「最新」に含め、翌日0時以降を「過去」に振り分ける基準に使う。
   */
  eventEndDate: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isValidStoredEventEnd(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  return isValid(parseISO(value))
}

export function normalizeNewsRecord(value: unknown): NewsRecord | null {
  if (typeof value !== "object" || value === null) return null
  const o = value as Record<string, unknown>
  if (
    typeof o.id !== "string" ||
    o.id.trim().length === 0 ||
    typeof o.date !== "string" ||
    typeof o.title !== "string" ||
    typeof o.venue !== "string" ||
    typeof o.eventEndDate !== "string"
  ) {
    return null
  }
  if (!isValidStoredEventEnd(o.eventEndDate)) return null
  const title = o.title.trim()
  const venue = o.venue.trim()
  const date = o.date.trim()
  if (title.length === 0 || venue.length === 0 || date.length === 0) return null
  let content: string | undefined
  if (typeof o.content === "string") {
    const t = o.content.trim()
    content = t.length > 0 ? t.slice(0, NEWS_CONTENT_MAX) : undefined
  }
  return {
    id: o.id.trim(),
    date: date.slice(0, 120),
    title: title.slice(0, NEWS_TITLE_MAX),
    venue: venue.slice(0, NEWS_VENUE_MAX),
    content,
    eventEndDate: o.eventEndDate.trim(),
  }
}

/** イベント終了日の「翌日0時」。この時刻未満なら最新欄、以降なら過去欄。 */
export function getNewsArchiveThreshold(record: NewsRecord): Date {
  const end = parseISO(record.eventEndDate)
  if (!isValid(end)) {
    return startOfDay(new Date(0))
  }
  return startOfDay(addDays(end, 1))
}

/**
 * 現在時刻 `now` に基づき、最新 / 過去に振り分ける（表示側の .filter 相当）。
 */
export function partitionNewsByArchiveThreshold(
  items: NewsRecord[],
  now: Date,
): { current: NewsRecord[]; past: NewsRecord[] } {
  const safeNow = isValid(now) ? now : new Date()
  const current = items.filter((item) => isBefore(safeNow, getNewsArchiveThreshold(item)))
  const past = items.filter((item) => !isBefore(safeNow, getNewsArchiveThreshold(item)))
  return { current, past }
}

/** 読み込み後: 重複 id は先頭優先、無効な eventEndDate は除外済みを前提。 */
export function dedupeNewsRecordsByIdFirstWins(items: NewsRecord[]): NewsRecord[] {
  const seen = new Set<string>()
  const out: NewsRecord[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}
