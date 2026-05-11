import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatReportDateJp } from "@/lib/format-report-date"
import reportsJson from "@/data/vercel-analytics-reports.json"

type KpiRow = { label: string; value: string }
type TopPageRow = { path: string; views: string }

type AnalyticsReport = {
  snapshotDate: string
  dataPeriodLabel: string
  documentTitle: string
  kpis: KpiRow[]
  topPages?: TopPageRow[]
  notes?: string[]
}

function parseReports(): AnalyticsReport[] {
  const raw = reportsJson as { reports?: AnalyticsReport[] }
  if (!Array.isArray(raw.reports)) return []
  return raw.reports
}

function sortBySnapshotDesc(a: AnalyticsReport, b: AnalyticsReport): number {
  return b.snapshotDate.localeCompare(a.snapshotDate)
}

export function StaffAnalyticsReports() {
  const reports = [...parseReports()].sort(sortBySnapshotDesc)

  if (reports.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/20">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/vercel-analytics-reports.json</code>
          にレポートを追加すると、ここに掲載されます。
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-8" aria-labelledby="analytics-reports-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="analytics-reports-heading" className="text-xl font-bold text-foreground">
          Analytics レポート（PDF 形式のまとめ）
        </h2>
        <p className="text-xs text-muted-foreground max-w-md text-right">
          掲載内容はリポジトリの JSON を更新して反映します（デプロイが必要です）。
        </p>
      </div>

      {reports.map((report, index) => (
        <Card
          key={`${report.snapshotDate}-${index}`}
          className="border-border overflow-hidden"
        >
          <CardHeader className="border-b border-border bg-secondary/30 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="flex items-start gap-2 text-lg md:text-xl font-semibold leading-snug">
                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{report.documentTitle}</span>
              </CardTitle>
              <Badge variant="outline" className="shrink-0 border-primary/40 text-primary">
                掲載日 {formatReportDateJp(report.snapshotDate)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/90">対象期間:</span>{" "}
              {report.dataPeriodLabel}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">主要指標</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {report.kpis.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
                    <p className="text-lg font-bold tabular-nums text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {report.topPages && report.topPages.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">ページ別（上位）</h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left">
                        <th className="px-4 py-2 font-medium text-muted-foreground">ページ</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground w-28 text-right">
                          ビュー
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topPages.map((row, i) => (
                        <tr key={`${row.path}-${i}`} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-2.5 font-mono text-xs break-all">{row.path}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{row.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {report.notes && report.notes.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">メモ</h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground leading-relaxed">
                  {report.notes.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
