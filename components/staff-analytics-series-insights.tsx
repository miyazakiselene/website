"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatReportDateJp } from "@/lib/format-report-date"
import type { AnalyticsReportJson } from "@/lib/analytics-series"
import {
  buildPathGrowthRows,
  buildSnapshotInsightRows,
  buildVisitorChartPoints,
  formatSignedPct,
  sortReportsAsc,
} from "@/lib/analytics-series"

type Props = {
  reports: AnalyticsReportJson[]
}

export function StaffAnalyticsSeriesInsights({ reports }: Props) {
  const asc = sortReportsAsc(reports)
  const insightRows = buildSnapshotInsightRows(asc)
  const displayRows = [...insightRows].reverse()
  const chartPoints = buildVisitorChartPoints(asc)
  const pathGrowth = buildPathGrowthRows(asc)
  const multi = asc.length >= 2

  return (
    <section className="space-y-8" aria-labelledby="series-insights-heading">
      <div className="space-y-2">
        <h2 id="series-insights-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          複数回の PDF から見る推移（独自分析）
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {multi
            ? "掲載日が新しい順に、前回の PDF からの伸び率と、ページビュー目安の累積合計を出しています。グラフは時系列（古い→新しい）です。"
            : "2回目以降の PDF を `data/vercel-analytics-reports.json` の先頭に追加すると、前回比・累積・グラフが自動で埋まります。各レポートに `stats` があると計算が安定します。"}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.04]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">スナップショット比較（表）</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">掲載日</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">訪問者</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">前回比</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">PV目安</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">前回比</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">累積PV</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">直帰率</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.snapshotDate} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2.5 font-medium">
                    {formatReportDateJp(row.snapshotDate)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.visitors}</td>
                  <td className="px-3 py-2.5 text-right text-xs">
                    {row.visitorsChange !== null ? (
                      <Badge variant="outline" className="font-normal tabular-nums">
                        {formatSignedPct(row.visitorsChange)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.pageViews}</td>
                  <td className="px-3 py-2.5 text-right text-xs">
                    {row.pageViewsChange !== null ? (
                      <Badge variant="outline" className="font-normal tabular-nums">
                        {formatSignedPct(row.pageViewsChange)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {row.cumulativePageViews}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.bounce}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {multi ? (
        <>
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base md:text-lg">訪問者・ページビュー累積の推移（グラフ）</CardTitle>
              <p className="text-xs text-muted-foreground pt-1">
                棒グラフ＝その週の PV 目安、折れ線＝訪問者数、緑の折れ線＝累積 PV（各週の足し上げ）
              </p>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={32} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={36} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number | string, name: string) => [value, name]}
                    labelFormatter={(label) => `掲載日 ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="pageViews"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="PV（週目安）"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(38 92% 50%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="訪問者"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativePageViews"
                    stroke="hsl(142 76% 36%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="累積PV"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {pathGrowth.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg">ページ別：直近2回の PDF の伸び</CardTitle>
                <p className="text-xs text-muted-foreground">
                  いちばん新しい掲載日と、そのひとつ前の PDF を比較しています。
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">ページ</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">パス</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">前回</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">最新</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">伸び率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathGrowth.map((row) => (
                      <tr key={row.path} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2">{row.label}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.path}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{row.prev}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{row.latest}</td>
                        <td className="px-3 py-2 text-right text-xs">{formatSignedPct(row.change)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
