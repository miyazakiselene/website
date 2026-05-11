export type MatchRecord = {
  id: string
  date: string
  opponent: string
  quarter: number
  ourScore: number
  theirScore: number
  videoUrls?: string[]
}

export type TournamentRecord = {
  id: string
  year: string
  name: string
  venue: string
  matches: MatchRecord[]
}

export const STAFF_RECORDS_STORAGE_KEY = "selene-staff-results-v5"

export function normalizeMatchVideoUrls(match: MatchRecord): MatchRecord {
  const q = Math.max(0, match.quarter)
  let urls = Array.isArray(match.videoUrls) ? [...match.videoUrls] : []
  while (urls.length < q) urls.push("")
  urls = urls.slice(0, q)
  return { ...match, videoUrls: urls }
}

/** API 保存時と同じ形に揃える */
export function normalizeTournamentRecords(records: TournamentRecord[]): TournamentRecord[] {
  return records.map((record) => ({
    ...record,
    venue: record.venue ?? "",
    matches: (record.matches ?? []).map((match) => normalizeMatchVideoUrls({ ...match })),
  }))
}

/**
 * サーバー（リポジトリの JSON 等）から取ったデータに、この端末の試合動画 URL を足し合わせる。
 * 同一 match.id なら「サーバー側に URL があればそれを優先、なければローカル」を採用。
 * ローカルだけにある大会は末尾に残す。
 */
export function mergeStaffRecordsFromServerAndLocal(
  server: TournamentRecord[],
  local: TournamentRecord[],
): TournamentRecord[] {
  const serverTournamentIds = new Set(server.map((t) => t.id))
  const localOnlyTournaments = local.filter((t) => !serverTournamentIds.has(t.id))

  const localMatchById = new Map<string, MatchRecord>()
  for (const t of local) {
    for (const m of t.matches) {
      localMatchById.set(m.id, m)
    }
  }

  const mergedServer = server.map((t) => ({
    ...t,
    matches: t.matches.map((m) => {
      const lm = localMatchById.get(m.id)
      if (!lm) return normalizeMatchVideoUrls(m)
      const q = Math.max(0, m.quarter)
      const fromServer = m.videoUrls ?? []
      const fromLocal = lm.videoUrls ?? []
      const merged: string[] = []
      for (let i = 0; i < q; i++) {
        const s = (fromServer[i] ?? "").trim()
        const l = (fromLocal[i] ?? "").trim()
        merged.push(s || l)
      }
      return normalizeMatchVideoUrls({ ...m, videoUrls: merged })
    }),
  }))

  const extras = localOnlyTournaments.map((t) => ({
    ...t,
    matches: t.matches.map((m) => normalizeMatchVideoUrls({ ...m })),
  }))

  return [...mergedServer, ...extras]
}
