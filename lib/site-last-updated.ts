import "server-only"

import { isValid, parseISO } from "date-fns"
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** "YYYY-MM-DD" として妥当な文字列だけを返す（前後空白は除去）。 */
function normalizeIso(value: string | undefined | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (!ISO_DATE.test(trimmed)) return null
  return isValid(parseISO(trimmed)) ? trimmed : null
}

/**
 * 指定時刻の「日本（Asia/Tokyo）での今日」を "YYYY-MM-DD" で返す。
 * Vercel など UTC で動くサーバーでも、日本時間の日付で判定するために使う。
 */
function getTodayIsoInTokyo(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
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
 * サイト更新日（"YYYY-MM-DD"）= 次の候補のうち「今日（日本時間）以前で最も新しい日」。
 *   - お知らせのイベント終了日（過去に移動した日）
 *   - 活動記録の終了日（更新があった日）
 *   - Instagram 投稿日
 *   - その他のサイト修正日
 *
 * 未来日（これから開催の予定など）は、SEO 上 lastmod が未来にならないよう除外する。
 * 日付は "YYYY-MM-DD" 文字列のまま辞書順で比較するため、タイムゾーンの影響を受けない。
 */
export function computeSiteLastUpdatedIso(input: ComputeInput): string {
  const todayIso = getTodayIsoInTokyo(input.now != null && isValid(input.now) ? input.now : new Date())

  const candidates: string[] = []
  for (const value of [
    ...input.newsEndDates,
    ...input.activityEndDates,
    input.instagramDate ?? "",
    input.manualDate ?? "",
  ]) {
    const iso = normalizeIso(value)
    if (iso != null && iso <= todayIso) {
      candidates.push(iso)
    }
  }

  if (candidates.length === 0) return todayIso
  return candidates.reduce((a, b) => (a >= b ? a : b))
}

/** サイト更新日（Date）。内部的には "YYYY-MM-DD" を UTC 0時として解釈する。 */
export function computeSiteLastUpdated(input: ComputeInput): Date {
  return parseISO(computeSiteLastUpdatedIso(input))
}

async function loadComputeInput(now: Date): Promise<ComputeInput> {
  const [news, activities] = await Promise.all([readNewsRecords(), readActivityRecords()])
  return {
    newsEndDates: news.map((n) => n.eventEndDate),
    activityEndDates: activities.map((a) => a.endDate),
    instagramDate: INSTAGRAM_LAST_POST_DATE,
    manualDate: SITE_CONTENT_EDITED_DATE,
    now,
  }
}

/** サイト更新日の "YYYY-MM-DD" 文字列。お知らせ・活動記録を読み込んで算出する。 */
export async function getSiteLastUpdatedIso(now: Date = new Date()): Promise<string> {
  return computeSiteLastUpdatedIso(await loadComputeInput(now))
}

/** サイト全体の最終更新日（Date）。 */
export async function getSiteLastUpdatedDate(now: Date = new Date()): Promise<Date> {
  return parseISO(await getSiteLastUpdatedIso(now))
}
