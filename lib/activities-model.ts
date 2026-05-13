import {
  ACTIVITIES_CONTENT_MAX,
  ACTIVITIES_LOCATION_MAX,
  ACTIVITIES_OPPONENT_MAX,
  ACTIVITIES_TITLE_MAX,
} from "@/lib/activities-validation"

export type ActivityRecord = {
  id: string
  date: string
  title: string
  location: string
  content: string
  opponent: string
}

function sliceStr(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/

export function normalizeActivityRecord(raw: unknown): ActivityRecord | null {
  if (raw === null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === "string" ? o.id.trim() : ""
  const date = typeof o.date === "string" ? o.date.trim() : ""
  const title = typeof o.title === "string" ? o.title.trim() : ""
  const location = typeof o.location === "string" ? o.location.trim() : ""
  const content = typeof o.content === "string" ? o.content.trim() : ""
  const opponent = typeof o.opponent === "string" ? o.opponent.trim() : ""
  if (id.length === 0 || !isoDate.test(date) || title.length === 0 || opponent.length === 0) return null
  return {
    id,
    date,
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
