import { addDays, isBefore, parseISO, startOfDay } from "date-fns"

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

export function normalizeNewsRecord(value: unknown): NewsRecord | null {
  if (typeof value !== "object" || value === null) return null
  const o = value as Record<string, unknown>
  if (
    typeof o.id !== "string" ||
    typeof o.date !== "string" ||
    typeof o.title !== "string" ||
    typeof o.venue !== "string" ||
    typeof o.eventEndDate !== "string"
  ) {
    return null
  }
  return {
    id: o.id,
    date: o.date,
    title: o.title,
    venue: o.venue,
    content: typeof o.content === "string" ? o.content : undefined,
    eventEndDate: o.eventEndDate,
  }
}

/** イベント終了日の「翌日0時」。この時刻未満なら最新欄、以降なら過去欄。 */
export function getNewsArchiveThreshold(record: NewsRecord): Date {
  const end = parseISO(record.eventEndDate)
  return startOfDay(addDays(end, 1))
}

/**
 * 現在時刻 `now` に基づき、最新 / 過去に振り分ける（表示側の .filter 相当）。
 */
export function partitionNewsByArchiveThreshold(
  items: NewsRecord[],
  now: Date,
): { current: NewsRecord[]; past: NewsRecord[] } {
  const current = items.filter((item) => isBefore(now, getNewsArchiveThreshold(item)))
  const past = items.filter((item) => !isBefore(now, getNewsArchiveThreshold(item)))
  return { current, past }
}
