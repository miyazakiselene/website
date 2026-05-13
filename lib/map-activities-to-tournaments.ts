import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import type { ActivityRecord } from "@/lib/activities-model"
import type { Tournament } from "@/lib/activity-results-types"

/** 活動記録1件を、既存の活動記録カード（Tournament）表示用に変換する */
export function activityRecordToTournament(record: ActivityRecord): Tournament {
  const parsed = parseISO(record.date)
  const period = format(parsed, "yyyy年M月d日", { locale: ja })
  const slashDate = format(parsed, "M/d", { locale: ja })
  const contentTrimmed = record.content.trim()
  return {
    id: record.id,
    period,
    year: format(parsed, "yyyy'年度'", { locale: ja }),
    name: record.title,
    venue: record.location.trim() || undefined,
    matches: [
      {
        id: `${record.date}-activity-${record.id}`,
        date: slashDate,
        opponent: record.opponent,
        ...(contentTrimmed.length > 0 ? { content: contentTrimmed } : {}),
      },
    ],
  }
}

export function mapActivitiesToTournaments(records: ActivityRecord[]): Tournament[] {
  return records.map(activityRecordToTournament)
}
