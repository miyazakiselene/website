const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/

export function parseIsoPrefixTimeMs(id: string): number | null {
  const m = id.match(ISO_DATE_PREFIX)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d).getTime()
}

export function parseSlashDateTimeMs(date: string, calendarYear: number): number | null {
  const m = date.trim().match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!m) return null
  return new Date(calendarYear, Number(m[1]) - 1, Number(m[2])).getTime()
}

/** 令和 n 年 → 西暦（R1=2019） */
export function calendarYearFromReiwaLabel(yearLabel: string): number | null {
  const m = yearLabel.match(/R(\d+)/i)
  if (!m) return null
  return 2018 + Number(m[1])
}

export function inferCalendarYearFromYearLabel(yearLabel: string): number | null {
  const reiwa = calendarYearFromReiwaLabel(yearLabel)
  if (reiwa !== null) return reiwa
  const m = yearLabel.match(/(20\d{2})/)
  return m ? Number(m[1]) : null
}

export function inferCalendarYearFromTournamentId(id: string): number | null {
  const m = id.match(/(20\d{2})/)
  return m ? Number(m[1]) : null
}

export function inferCalendarYearFromPeriod(period: string): number | null {
  const m = period.match(/(\d{4})年/)
  return m ? Number(m[1]) : null
}

function inferYearForPublicTournament(t: { id: string; period: string }): number {
  return (
    inferCalendarYearFromPeriod(t.period) ??
    inferCalendarYearFromTournamentId(t.id) ??
    new Date().getFullYear()
  )
}

export function publicTournamentCalendarYear(t: { id: string; period: string }): number {
  return inferYearForPublicTournament(t)
}

function inferYearForStaffRecord(r: { id: string; year: string }): number {
  return (
    inferCalendarYearFromTournamentId(r.id) ??
    inferCalendarYearFromYearLabel(r.year) ??
    new Date().getFullYear()
  )
}

export function matchSortTimeMs(
  match: { id: string; date: string },
  calendarYear: number,
): number {
  return (
    parseIsoPrefixTimeMs(match.id) ??
    parseSlashDateTimeMs(match.date, calendarYear) ??
    0
  )
}

function emptyTournamentPlaceholderMs(
  t: { id: string; period?: string; year?: string },
): number {
  const y =
    t.period !== undefined
      ? inferYearForPublicTournament(t as { id: string; period: string })
      : t.year !== undefined
        ? inferYearForStaffRecord(t as { id: string; year: string })
        : inferCalendarYearFromTournamentId(t.id) ?? new Date().getFullYear()
  return new Date(y, 0, 1).getTime()
}

export function tournamentLatestTimeMs(t: {
  id: string
  period?: string
  year?: string
  matches: { id: string; date: string }[]
}): number {
  if (t.matches.length === 0) return emptyTournamentPlaceholderMs(t)
  const year =
    t.period !== undefined
      ? inferYearForPublicTournament(t as { id: string; period: string })
      : t.year !== undefined
        ? inferYearForStaffRecord(t as { id: string; year: string })
        : inferCalendarYearFromTournamentId(t.id) ?? new Date().getFullYear()
  return Math.max(...t.matches.map((m) => matchSortTimeMs(m, year)))
}

export function sortTournamentsNewestFirst<
  T extends { id: string; period?: string; year?: string; matches: { id: string; date: string }[] },
>(list: T[]): T[] {
  return [...list].sort((a, b) => tournamentLatestTimeMs(b) - tournamentLatestTimeMs(a))
}

export function sortMatchesNewestFirst<M extends { id: string; date: string }>(
  matches: M[],
  ctx: { id: string; period?: string; year?: string },
): M[] {
  const year =
    ctx.period !== undefined
      ? inferYearForPublicTournament(ctx as { id: string; period: string })
      : ctx.year !== undefined
        ? inferYearForStaffRecord(ctx as { id: string; year: string })
        : inferCalendarYearFromTournamentId(ctx.id) ?? new Date().getFullYear()
  return [...matches].sort((a, b) => matchSortTimeMs(b, year) - matchSortTimeMs(a, year))
}

export function sortSlashDateStringsDesc(dates: string[], calendarYear: number): string[] {
  return [...dates].sort((a, b) => {
    const tb = parseSlashDateTimeMs(b, calendarYear) ?? 0
    const ta = parseSlashDateTimeMs(a, calendarYear) ?? 0
    return tb - ta
  })
}

/** 関係者ページの大会・各試合を新しい順に整列（表示・保存用） */
export function sortStaffRecordsNewestFirst<
  T extends { id: string; year: string; matches: { id: string; date: string }[] },
>(records: T[]): T[] {
  const sorted = sortTournamentsNewestFirst(records)
  return sorted.map((r) => ({
    ...r,
    matches: sortMatchesNewestFirst(r.matches, { id: r.id, year: r.year }),
  }))
}
