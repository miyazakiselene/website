import Link from "next/link"
import { BarChart3, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const analyticsUrl = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL?.trim() ?? ""

export function StaffAnalyticsCallout() {
  return (
    <Card className="mb-8 border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          サイトのアクセス状況（Vercel Analytics）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          訪問数・ページビューなどは Vercel の Web Analytics 画面で確認できます。
          グラフの中身をこのページ内にそのまま埋め込む公式機能はないため、
          関係者には Vercel チームへの招待、または下のリンクから開いてもらう形になります。
        </p>
        {analyticsUrl !== "" ? (
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
            <Link href={analyticsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Vercel Analytics を開く
            </Link>
          </Button>
        ) : (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
            管理者向け: 本番の環境変数に{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              NEXT_PUBLIC_VERCEL_ANALYTICS_URL
            </code>{" "}
            を設定すると、ここにボタンが表示されます（Vercel プロジェクトの Analytics
            ページの URL）。
          </p>
        )}
        <p className="text-xs">
          ※ 表示には Vercel のプロジェクトへのアクセス権（チーム招待）が必要です。
        </p>
      </CardContent>
    </Card>
  )
}
