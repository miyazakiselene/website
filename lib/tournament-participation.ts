import "server-only"

import { isValid, parseISO, startOfDay } from "date-fns"
import { readActivityRecords } from "@/lib/activities"
import { readNewsRecords } from "@/lib/news"
import { readStaffTournamentRecords } from "@/lib/staff-results-storage"

export type ParticipationStatus = "participated" | "planned"

type TrackedTournament = {
  key: string
  /** 大会名の判定キーワード（小文字化して部分一致） */
  keywords: string[]
  labelJa: string
  /** 文中に差し込む英語表記（必要な冠詞込み） */
  labelEn: string
}

/**
 * 出場状況を自動追跡する大会。
 * お知らせ・活動記録・試合結果のいずれかで「開催済み」が確認できたら
 * 自動で「参加しました」に切り替わる。
 */
const TRACKED_TOURNAMENTS: TrackedTournament[] = [
  {
    key: "club-championship",
    keywords: ["クラブ選手権"],
    labelJa: "宮崎県クラブ選手権",
    labelEn: "the Miyazaki Club Championship",
  },
  {
    key: "winter-cup",
    keywords: ["ウィンターカップ", "ウインターカップ", "ジュニアウィンター", "winter cup", "wintercup"],
    labelJa: "U15ジュニアウィンターカップ予選",
    labelEn: "the U15 Junior Winter Cup qualifier",
  },
]

function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k.toLowerCase()))
}

function isPastOrTodayIso(iso: string | undefined, today: Date): boolean {
  if (iso == null || iso.trim().length === 0) return false
  const d = parseISO(iso)
  return isValid(d) && startOfDay(d).getTime() <= today.getTime()
}

/**
 * 追跡対象の各大会について「参加しました／参加する予定です」を判定する。
 *
 * 「参加しました」になる条件（いずれか）:
 *   - 活動記録に大会名が含まれ、かつ終了日が今日以前
 *   - 試合結果（正本）に大会名が含まれる（＝結果が記録済み）
 *   - お知らせに大会名が含まれ、かつ終了日が今日以前（＝過去のお知らせへ移動済み）
 */
export async function getTournamentParticipation(
  now: Date = new Date(),
): Promise<Record<string, ParticipationStatus>> {
  const today = startOfDay(now)
  const [news, activities, staffTournaments] = await Promise.all([
    readNewsRecords(),
    readActivityRecords(),
    readStaffTournamentRecords(),
  ])

  const result: Record<string, ParticipationStatus> = {}

  for (const tournament of TRACKED_TOURNAMENTS) {
    let participated = false

    for (const a of activities) {
      const text = `${a.title} ${a.content} ${a.opponent}`
      if (matchesKeyword(text, tournament.keywords) && isPastOrTodayIso(a.endDate, today)) {
        participated = true
        break
      }
    }

    if (!participated) {
      for (const s of staffTournaments) {
        if (matchesKeyword(s.name, tournament.keywords)) {
          participated = true
          break
        }
      }
    }

    if (!participated) {
      for (const n of news) {
        const text = `${n.title} ${n.content ?? ""}`
        if (matchesKeyword(text, tournament.keywords) && isPastOrTodayIso(n.eventEndDate, today)) {
          participated = true
          break
        }
      }
    }

    result[tournament.key] = participated ? "participated" : "planned"
  }

  return result
}

/** 英語の列挙: "A" / "A and B" / "A, B, and C" */
function joinEn(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0] ?? ""
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

/**
 * FAQ「どんな大会に出場していますか？」の回答文を、参加状況に応じて生成する。
 * 既存のFAQのトーン（です・ます調 / 丁寧な案内）に合わせている。
 */
export function buildTournamentFaqAnswer(
  status: Record<string, ParticipationStatus>,
  locale: string,
): string {
  const done = TRACKED_TOURNAMENTS.filter((t) => status[t.key] === "participated")
  const planned = TRACKED_TOURNAMENTS.filter((t) => status[t.key] !== "participated")

  if (locale === "en") {
    const parts: string[] = []
    if (done.length > 0) {
      parts.push(`We have competed in ${joinEn(done.map((t) => t.labelEn))}.`)
    }
    if (planned.length > 0) {
      parts.push(`We plan to compete in ${joinEn(planned.map((t) => t.labelEn))}.`)
    }
    parts.push(
      "We also play practice matches against teams throughout the region. See the Activity Records section for the latest results.",
    )
    return parts.join(" ")
  }

  const parts: string[] = []
  if (done.length > 0) {
    parts.push(`${done.map((t) => t.labelJa).join("・")}に参加しました。`)
  }
  if (planned.length > 0) {
    parts.push(`${planned.map((t) => t.labelJa).join("・")}に参加する予定です。`)
  }
  parts.push(
    "また、県内外チームとの練習試合に参加しています。最新の試合・大会情報は「活動記録」セクションでご確認ください。",
  )
  return parts.join("")
}

/** お知らせ・活動記録・試合結果を読み込んで、ロケール別の回答文を返す。 */
export async function getTournamentFaqAnswer(
  locale: string,
  now: Date = new Date(),
): Promise<string> {
  const status = await getTournamentParticipation(now)
  return buildTournamentFaqAnswer(status, locale)
}
