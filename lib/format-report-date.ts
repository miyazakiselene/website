/** `YYYY-MM-DD` を日本語表記に（例: 2026年5月11日） */
export function formatReportDateJp(isoDate: string): string {
  const m = isoDate.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return isoDate
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  return `${y}年${mo}月${d}日`
}
