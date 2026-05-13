import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { formatOpponentsDisplayJa, type ActivityRecord } from "@/lib/activities-model"
import type { Tournament } from "@/lib/activity-results-types"

/** トップ表示用：期間の見出し（例: 2026年5月10日 / 2026年5月10日〜12日） */
export function formatActivityPeriodHeading(startIso: string, endIso: string): string {
  const s = parseISO(startIso)
  const e = parseISO(endIso)
  if (startIso === endIso) {
    return format(s, "yyyy年M月d日", { locale: ja })
  }
  const y1 = format(s, "yyyy", { locale: ja })
  const y2 = format(e, "yyyy", { locale: ja })
  if (y1 === y2) {
    return `${y1}年${format(s, "M月d日", { locale: ja })}〜${format(e, "M月d日", { locale: ja })}`
  }
  return `${format(s, "yyyy年M月d日", { locale: ja })}〜${format(e, "yyyy年M月d日", { locale: ja })}`
}

/** アコーディオン内の日付ラベル（M/d） */
function formatActivitySlashRange(startIso: string, endIso: string): string {
  const s = parseISO(startIso)
  const e = parseISO(endIso)
  if (startIso === endIso) return format(s, "M/d", { locale: ja })
  return `${format(s, "M/d", { locale: ja })}〜${format(e, "M/d", { locale: ja })}`
}

/** 活動記録1件を、既存の活動記録カード（Tournament）表示用に変換する */
export function activityRecordToTournament(record: ActivityRecord): Tournament {
  const period = formatActivityPeriodHeading(record.startDate, record.endDate)
  const slashDate = formatActivitySlashRange(record.startDate, record.endDate)
  const contentTrimmed = record.content.trim()
  const yearSource = parseISO(record.endDate)
  return {
    id: record.id,
    period,
    year: format(yearSource, "yyyy'年度'", { locale: ja }),
    name: record.title,
    venue: record.location.trim() || undefined,
    matches: [
      {
        id: `${record.endDate}-activity-${record.id}`,
        date: slashDate,
        opponent: formatOpponentsDisplayJa(record.opponent),
        ...(contentTrimmed.length > 0 ? { content: contentTrimmed } : {}),
      },
    ],
  }
}

export function mapActivitiesToTournaments(records: ActivityRecord[]): Tournament[] {
  return records.map(activityRecordToTournament)
}
