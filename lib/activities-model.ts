import {
  ACTIVITIES_CONTENT_MAX,
  ACTIVITIES_LOCATION_MAX,
  ACTIVITIES_OPPONENT_MAX,
  ACTIVITIES_TITLE_MAX,
} from "@/lib/activities-validation"

export type ActivityRecord = {
  id: string
  /** イベント開始日 YYYY-MM-DD */
  startDate: string
  /** イベント終了日 YYYY-MM-DD（1日のみのときは開始と同じ） */
  endDate: string
  title: string
  location: string
  content: string
  opponent: string
}

function sliceStr(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/

/** 管理画面など用：期間を1行で表示 */
export function formatActivityDateRangeJa(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    const [y, m, d] = startDate.split("-")
    if (!y || !m || !d) return startDate
    return `${y}年${Number(m)}月${Number(d)}日`
  }
  const [ys, ms, ds] = startDate.split("-")
  const [ye, me, de] = endDate.split("-")
  if (!ys || !ms || !ds || !ye || !me || !de) return `${startDate}〜${endDate}`
  return `${ys}年${Number(ms)}月${Number(ds)}日〜${ye}年${Number(me)}月${Number(de)}日`
}

export function normalizeActivityRecord(raw: unknown): ActivityRecord | null {
  if (raw === null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === "string" ? o.id.trim() : ""
  const startRaw = typeof o.startDate === "string" ? o.startDate.trim() : ""
  const endRaw = typeof o.endDate === "string" ? o.endDate.trim() : ""
  const legacyDate = typeof o.date === "string" ? o.date.trim() : ""

  const startDate = isoDate.test(startRaw) ? startRaw : isoDate.test(legacyDate) ? legacyDate : ""
  if (startDate === "") return null

  let endDate = isoDate.test(endRaw) ? endRaw : ""
  if (endDate === "") endDate = startDate
  if (endDate < startDate) return null

  const title = typeof o.title === "string" ? o.title.trim() : ""
  const location = typeof o.location === "string" ? o.location.trim() : ""
  const content = typeof o.content === "string" ? o.content.trim() : ""
  const opponent = typeof o.opponent === "string" ? o.opponent.trim() : ""

  if (id.length === 0 || !isoDate.test(startDate) || !isoDate.test(endDate)) return null
  if (title.length === 0 || opponent.length === 0) return null

  return {
    id,
    startDate,
    endDate,
    title: sliceStr(title, ACTIVITIES_TITLE_MAX),
    location: sliceStr(location, ACTIVITIES_LOCATION_MAX),
    content: sliceStr(content, ACTIVITIES_CONTENT_MAX),
    opponent: sliceStr(opponent, ACTIVITIES_OPPONENT_MAX),
  }
}

export function dedupeActivitiesByIdFirstWins(items: ActivityRecord[]): ActivityRecord[] {
  const seen = new Set<string>()
  const out: ActivityRecord[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}
