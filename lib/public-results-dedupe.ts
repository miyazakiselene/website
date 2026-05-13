import type { Tournament } from "@/lib/activity-results-types"

/**
 * staff-records.json の「練習試合（月/日）」見出し。
 * data/activities.json の活動記録と同一イベントが二重表示されるため、トップの活動記録からは除外する。
 */
const STAFF_PRACTICE_SCRIM_PAREN_DATE = /^練習試合[（(]\d{1,2}\/\d{1,2}[）)]$/

export function filterStaffTournamentsForPublicTop(staff: Tournament[]): Tournament[] {
  return staff.filter((t) => !STAFF_PRACTICE_SCRIM_PAREN_DATE.test(t.name.trim()))
}
