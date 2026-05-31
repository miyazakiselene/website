import "server-only"

import { isValid, parseISO, startOfDay } from "date-fns"
import { readActivityRecords } from "@/lib/activities"
import { readNewsRecords } from "@/lib/news"

/**
 * サイトの「中身が最後に変わった日」を表す手動の基準日（YYYY-MM-DD）。
 *
 * 次のような変更をしたら、この日付を更新してください:
 *   - お知らせ／活動記録以外の文章・写真・FAQ・選手紹介などを修正したとき
 *   - 仕組み（コード）を更新したとき
 *
 * お知らせ・活動記録の日付からも自動で最新日を拾うため、ここを更新し忘れても
 * 極端に古い日付にはなりません。
 */
const SITE_CONTENT_EDITED_DATE = process.env.SITE_CONTENT_EDITED_DATE ?? "2026-06-01"

/**
 * 直近の Instagram 投稿日（YYYY-MM-DD）。Instagram に投稿したら更新してください。
 */
const INSTAGRAM_LAST_POST_DATE = process.env.INSTAGRAM_LAST_POST_DATE ?? "2026-05-31"

function toDateOrNull(value: string | undefined | null): Date | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  const d = parseISO(trimmed)
  return isValid(d) ? startOfDay(d) : null
}

type ComputeInput = {
  /** お知らせのイベント終了日（YYYY-MM-DD）。終了＝「過去のお知らせ」へ移動した日。 */
  newsEndDates: string[]
  /** 活動記録の終了日（YYYY-MM-DD）。最新の活動＝更新があった日。 */
  activityEndDates: string[]
  /** Instagram の最終投稿日（YYYY-MM-DD）。 */
  instagramDate?: string
  /** その他のサイト修正日（YYYY-MM-DD）。 */
  manualDate?: string
  /** 判定基準の現在時刻（テスト用）。 */
  now?: Date
}

/**
 * サイト更新日 = 次の候補のうち「今日以前で最も新しい日」。
 *   - お知らせのイベント終了日（過去に移動した日）
 *   - 活動記録の終了日（更新があった日）
 *   - Instagram 投稿日
 *   - その他のサイト修正日
 *
 * 未来日（これから開催の予定など）は、SEO 上 lastmod が未来にならないよう除外する。
 */
export function computeSiteLastUpdated(input: ComputeInput): Date {
  const now = input.now != null && isValid(input.now) ? input.now : new Date()
  const today = startOfDay(now)

  const candidates: Date[] = []
  for (const value of [
    ...input.newsEndDates,
    ...input.activityEndDates,
    input.instagramDate ?? "",
    input.manualDate ?? "",
  ]) {
    const d = toDateOrNull(value)
    if (d != null && d.getTime() <= today.getTime()) {
      candidates.push(d)
    }
  }

  if (candidates.length === 0) return today
  return candidates.reduce((a, b) => (a.getTime() >= b.getTime() ? a : b))
}

/**
 * サイト全体の最終更新日（Date）。お知らせ・活動記録を読み込んで算出する。
 */
export async function getSiteLastUpdatedDate(now: Date = new Date()): Promise<Date> {
  const [news, activities] = await Promise.all([readNewsRecords(), readActivityRecords()])
  return computeSiteLastUpdated({
    newsEndDates: news.map((n) => n.eventEndDate),
    activityEndDates: activities.map((a) => a.endDate),
    instagramDate: INSTAGRAM_LAST_POST_DATE,
    manualDate: SITE_CONTENT_EDITED_DATE,
    now,
  })
}

/** Date → "YYYY-MM-DD"（タイムゾーンの影響を受けないようローカル日付で組み立て）。 */
export function formatIsoDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** サイト更新日の "YYYY-MM-DD" 文字列。 */
export async function getSiteLastUpdatedIso(now: Date = new Date()): Promise<string> {
  return formatIsoDateLocal(await getSiteLastUpdatedDate(now))
}
