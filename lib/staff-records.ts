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

export const STAFF_RECORDS_STORAGE_KEY = "selene-staff-results-v4"

export function normalizeMatchVideoUrls(match: MatchRecord): MatchRecord {
  const q = Math.max(0, match.quarter)
  let urls = Array.isArray(match.videoUrls) ? [...match.videoUrls] : []
  while (urls.length < q) urls.push("")
  urls = urls.slice(0, q)
  return { ...match, videoUrls: urls }
}
