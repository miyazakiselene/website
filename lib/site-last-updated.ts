import "server-only"

import { isValid, parseISO } from "date-fns"
import { readActivityRecords } from "@/lib/activities"
import { readNewsRecords } from "@/lib/news"
import { readLatestSupabaseContentUpdatedAt } from "@/lib/supabase-content-updated-at"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * 指定時刻の「日本（Asia/Tokyo）での日付」を "YYYY-MM-DD" で返す。
 * Vercel など UTC で動くサーバーでも、日本時間の日付で判定するために使う。
 */
function getTokyoDateIso(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/**
 * ビルド（デプロイ）時刻を日本時間の日付（YYYY-MM-DD）で返す。
 *
 * next.config.mjs で埋め込む `SITE_BUILD_TIME`（ビルド時の ISO 文字列）を基準にする。
 * これにより、文章・FAQ・選手紹介・写真・データ・コードなど「サイトの中身」を
 * 変更してデプロイすれば、その日が自動的に「サイト更新日」へ反映される（完全自動）。
 * 取得できない場合は実行時の現在時刻にフォールバックする。
 */
function getBuildDateIso(now: Date): string {
  const raw = process.env.SITE_BUILD_TIME
  const base = raw != null && raw.trim().length > 0 ? new Date(raw) : now
  const safe = isValid(base) ? base : now
  return getTokyoDateIso(safe)
}

/** "YYYY-MM-DD" として妥当な文字列だけを返す（前後空白は除去）。 */
function normalizeIso(value: string | undefined | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (!ISO_DATE.test(trimmed)) return null
  return isValid(parseISO(trimmed)) ? trimmed : null
}

type ComputeInput = {
  /** お知らせのイベント終了日（YYYY-MM-DD）。終了＝「過去のお知らせ」へ移動した日。 */
  newsEndDates: string[]
  /** 活動記録の終了日（YYYY-MM-DD）。最新の活動＝更新があった日。 */
  activityEndDates: string[]
  /** ビルド（デプロイ）日（YYYY-MM-DD）。サイトの文章・データ・コードの変更を反映。 */
  buildDate?: string
  /** Supabase 上の表示コンテンツの最終更新日（YYYY-MM-DD）。DBの文章編集を反映。 */
  dbContentDate?: string
  /** 判定基準の現在時刻。 */
  now?: Date
}

/**
 * サイト更新日（"YYYY-MM-DD"）= 次の候補のうち「今日（日本時間）以前で最も新しい日」。
 *   - ビルド（デプロイ）日 … サイト内の文章・FAQ・写真・データ・コードを変更すると更新
 *   - Supabase コンテンツの最終更新日 … 関係者ページからDBの文章を編集すると更新
 *   - お知らせのイベント終了日（過去に移動した日）
 *   - 活動記録の終了日（更新があった日）
 *
 * 文章を一文字でも変更すれば、その日が自動的に更新日になる。
 * 未来日（これから開催の予定など）は、SEO 上 lastmod が未来にならないよう除外する。
 * 日付は "YYYY-MM-DD" 文字列のまま辞書順で比較するため、タイムゾーンの影響を受けない。
 */
export function computeSiteLastUpdatedIso(input: ComputeInput): string {
  const todayIso = getTokyoDateIso(input.now != null && isValid(input.now) ? input.now : new Date())

  const candidates: string[] = []
  for (const value of [
    input.buildDate ?? "",
    input.dbContentDate ?? "",
    ...input.newsEndDates,
    ...input.activityEndDates,
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
  const [news, activities, dbUpdatedAt] = await Promise.all([
    readNewsRecords(),
    readActivityRecords(),
    readLatestSupabaseContentUpdatedAt(),
  ])
  const dbDate = dbUpdatedAt != null ? getTokyoDateIso(new Date(dbUpdatedAt)) : undefined
  return {
    newsEndDates: news.map((n) => n.eventEndDate),
    activityEndDates: activities.map((a) => a.endDate),
    buildDate: getBuildDateIso(now),
    dbContentDate: dbDate,
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
