import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatReportDateJp } from "@/lib/format-report-date"
import type { AnalyticsReportJson } from "@/lib/analytics-series"
import { StaffAnalyticsSeriesInsights } from "@/components/staff-analytics-series-insights"

type MetricRow = {
  title: string
  subtitle: string
  value: string
  unit: string
}

type TableSection = {
  caption: string
  columnLabels: [string, string] | [string, string, string]
  rows: Array<{ label: string; path?: string; count?: string; value?: string }>
}

type AnalyticsReport = {
  snapshotDate: string
  exportTitle: string
  dataSourceNote: string
  analysisPeriod: string
  deployment: string
  targetSite: string
  stats?: {
    uniqueVisitors: number
    bouncePercent: number
    pageViewsEstimate: number
  }
  metrics: MetricRow[]
  pageTable: TableSection & {
    rows: Array<{ label: string; path: string; count: string }>
  }
  referrers?: TableSection
  countries?: TableSection
  devices?: TableSection
  operatingSystems?: TableSection
  notes?: string[]
}

type StaffAnalyticsReportsProps = {
  reports: AnalyticsReportJson[]
}

function asAnalyticsReports(reports: AnalyticsReportJson[]): AnalyticsReport[] {
  return reports as unknown as AnalyticsReport[]
}

function sortBySnapshotDesc(a: AnalyticsReport, b: AnalyticsReport): number {
  return b.snapshotDate.localeCompare(a.snapshotDate)
}

function TwoColTable({
  caption,
  columnLabels,
  rows,
}: {
  caption: string
  columnLabels: [string, string]
  rows: Array<{ label: string; value: string }>
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{caption}</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-2 font-medium text-muted-foreground">{columnLabels[0]}</th>
              <th className="px-4 py-2 font-medium text-muted-foreground w-32 text-right">
                {columnLabels[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">{row.label}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StaffAnalyticsReports({ reports: reportsInput }: StaffAnalyticsReportsProps) {
  const reports = [...asAnalyticsReports(reportsInput)].sort(sortBySnapshotDesc)

  if (reports.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/20">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/vercel-analytics-reports.json</code>{" "}
          にレポートを追加するか、Supabase の{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">analytics_reports_snapshot</code>{" "}
          テーブルに <code className="rounded bg-muted px-1.5 py-0.5 text-xs">reports</code>{" "}
          配列を保存すると、ここに掲載されます。
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-10" aria-labelledby="analytics-reports-heading">
      <div className="space-y-2">
        <h2 id="analytics-reports-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          アクセスの見方（関係者向け）
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          次の表は、PDF に載っていた数字をそのまま日本語の見出しで整理したものです。用語に迷ったときは、各カード下の小さな説明文を読んでください。
        </p>
      </div>

      <StaffAnalyticsSeriesInsights reports={reportsInput} />

      {reports.map((report, index) => (
        <Card key={`${report.snapshotDate}-${index}`} className="border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-lg md:text-xl font-semibold leading-snug">
                {report.exportTitle}
              </CardTitle>
              <Badge variant="outline" className="shrink-0 border-primary/40 text-primary">
                データ取得日 {formatReportDateJp(report.snapshotDate)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.dataSourceNote}</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">集計の対象期間</dt>
                <dd className="font-medium text-foreground">{report.analysisPeriod}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">対象サイト</dt>
                <dd className="font-mono text-xs break-all text-foreground">{report.targetSite}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">環境</dt>
                <dd className="font-medium text-foreground">{report.deployment}</dd>
              </div>
            </dl>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">全体の数字（3つだけ先に覚える）</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {report.metrics.map((m) => (
                  <div
                    key={m.title}
                    className="rounded-xl border border-border bg-background px-4 py-4 space-y-2"
                  >
                    <p className="text-sm font-semibold text-foreground leading-snug">{m.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.subtitle}</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground pt-1">
                      {m.value}
                      <span className="ml-1 text-base font-normal text-muted-foreground">{m.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{report.pageTable.caption}</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left">
                      <th className="px-4 py-2 font-medium text-muted-foreground">
                        {report.pageTable.columnLabels[0]}
                      </th>
                      <th className="px-4 py-2 font-medium text-muted-foreground">
                        {report.pageTable.columnLabels[1]}
                      </th>
                      <th className="px-4 py-2 font-medium text-muted-foreground w-24 text-right">
                        {report.pageTable.columnLabels[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pageTable.rows.map((row, i) => (
                      <tr key={i} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-2.5">{row.label}</td>
                        <td className="px-4 py-2.5 font-mono text-xs break-all text-muted-foreground">
                          {row.path}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {report.referrers ? (
              <TwoColTable
                caption={report.referrers.caption}
                columnLabels={report.referrers.columnLabels as [string, string]}
                rows={report.referrers.rows.map((r) => ({ label: r.label, value: r.value ?? "" }))}
              />
            ) : null}

            {report.countries ? (
              <TwoColTable
                caption={report.countries.caption}
                columnLabels={report.countries.columnLabels as [string, string]}
                rows={report.countries.rows.map((r) => ({ label: r.label, value: r.value ?? "" }))}
              />
            ) : null}

            {report.devices ? (
              <TwoColTable
                caption={report.devices.caption}
                columnLabels={report.devices.columnLabels as [string, string]}
                rows={report.devices.rows.map((r) => ({ label: r.label, value: r.value ?? "" }))}
              />
            ) : null}

            {report.operatingSystems ? (
              <TwoColTable
                caption={report.operatingSystems.caption}
                columnLabels={report.operatingSystems.columnLabels as [string, string]}
                rows={report.operatingSystems.rows.map((r) => ({
                  label: r.label,
                  value: r.value ?? "",
                }))}
              />
            ) : null}

            {report.notes && report.notes.length > 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3">
                <p className="text-xs font-semibold text-foreground mb-2">運用上のメモ</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground leading-relaxed">
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
