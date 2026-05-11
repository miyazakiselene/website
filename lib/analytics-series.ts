/** PDF 複数回取り込み用：数値の抽出・前回比・累積・ページ横断の集計 */

export type PageRow = { label: string; path: string; count: string }

export type AnalyticsReportJson = {
  snapshotDate: string
  exportTitle: string
  dataSourceNote: string
  analysisPeriod: string
  deployment: string
  targetSite: string
  /** グラフ・伸び率計算用（2回目以降の PDF 取り込み時に必ず埋めることを推奨） */
  stats?: {
    uniqueVisitors: number
    bouncePercent: number
    pageViewsEstimate: number
  }
  metrics: Array<{ title: string; subtitle: string; value: string; unit: string }>
  pageTable: {
    caption: string
    columnLabels: string[]
    rows: PageRow[]
  }
  notes?: string[]
}

function parseIntLoose(s: string): number {
  const n = Number.parseInt(String(s).replace(/[^\d-]/g, ""), 10)
  return Number.isFinite(n) ? n : 0
}

function metricByTitle(report: AnalyticsReportJson, keyword: string): number {
  const m = report.metrics.find((x) => x.title.includes(keyword))
  return m ? parseIntLoose(m.value) : 0
}

export function getReportStats(report: AnalyticsReportJson): {
  visitors: number
  bounce: number
  pageViews: number
  pages: Record<string, number>
} {
  if (report.stats) {
    const pages: Record<string, number> = {}
    for (const row of report.pageTable.rows) {
      pages[row.path] = parseIntLoose(row.count)
    }
    return {
      visitors: report.stats.uniqueVisitors,
      bounce: report.stats.bouncePercent,
      pageViews: report.stats.pageViewsEstimate,
      pages,
    }
  }
  const pages: Record<string, number> = {}
  for (const row of report.pageTable.rows) {
    pages[row.path] = parseIntLoose(row.count)
  }
  const pvFromRows = Object.values(pages).reduce((a, b) => a + b, 0)
  return {
    visitors: metricByTitle(report, "訪問した人"),
    bounce: metricByTitle(report, "直帰率"),
    pageViews: metricByTitle(report, "ページビュー") || pvFromRows,
    pages,
  }
}

export function sortReportsAsc(reports: AnalyticsReportJson[]): AnalyticsReportJson[] {
  return [...reports].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
}

export function pctChange(prev: number, next: number): number | null {
  if (prev === 0) return next === 0 ? 0 : null
  return ((next - prev) / prev) * 100
}

export function formatSignedPct(p: number | null): string {
  if (p === null) return "—（前回が0）"
  const rounded = Math.round(p * 10) / 10
  if (rounded > 0) return `+${rounded}%`
  if (rounded < 0) return `${rounded}%`
  return "±0%"
}

export type SnapshotInsightRow = {
  snapshotDate: string
  labelJp: string
  visitors: number
  visitorsChange: number | null
  pageViews: number
  pageViewsChange: number | null
  cumulativePageViews: number
  bounce: number
}

export function buildSnapshotInsightRows(
  reportsAsc: AnalyticsReportJson[],
): SnapshotInsightRow[] {
  let cumPv = 0
  return reportsAsc.map((r, i) => {
    const s = getReportStats(r)
    cumPv += s.pageViews
    const prev = i > 0 ? getReportStats(reportsAsc[i - 1]!) : null
    return {
      snapshotDate: r.snapshotDate,
      labelJp: r.snapshotDate,
      visitors: s.visitors,
      visitorsChange: prev ? pctChange(prev.visitors, s.visitors) : null,
      pageViews: s.pageViews,
      pageViewsChange: prev ? pctChange(prev.pageViews, s.pageViews) : null,
      cumulativePageViews: cumPv,
      bounce: s.bounce,
    }
  })
}

/** 各パスについて「直近2回」の回数と伸び率（それ以上ある場合は最後の2点間） */
export function buildPathGrowthRows(
  reportsAsc: AnalyticsReportJson[],
): { path: string; label: string; prev: number; latest: number; change: number | null }[] {
  if (reportsAsc.length < 2) return []
  const a = reportsAsc[reportsAsc.length - 2]!
  const b = reportsAsc[reportsAsc.length - 1]!
  const sa = getReportStats(a)
  const sb = getReportStats(b)
  const paths = new Set([...Object.keys(sa.pages), ...Object.keys(sb.pages)])
  const rows: { path: string; label: string; prev: number; latest: number; change: number | null }[] = []
  for (const path of paths) {
    const prev = sa.pages[path] ?? 0
    const latest = sb.pages[path] ?? 0
    const label =
      b.pageTable.rows.find((x) => x.path === path)?.label ??
      a.pageTable.rows.find((x) => x.path === path)?.label ??
      path
    rows.push({
      path,
      label,
      prev,
      latest,
      change: pctChange(prev, latest),
    })
  }
  rows.sort((x, y) => y.latest - x.latest)
  return rows
}

export type VisitorChartPoint = {
  date: string
  visitors: number
  pageViews: number
  cumulativePageViews: number
}

export function buildVisitorChartPoints(reportsAsc: AnalyticsReportJson[]): VisitorChartPoint[] {
  let cum = 0
  return reportsAsc.map((r) => {
    const s = getReportStats(r)
    cum += s.pageViews
    return {
      date: r.snapshotDate,
      visitors: s.visitors,
      pageViews: s.pageViews,
      cumulativePageViews: cum,
    }
  })
}
