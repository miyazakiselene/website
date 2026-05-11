import Link from "next/link"
import { BarChart3, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

const analyticsUrl = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL?.trim() ?? ""

type StaffAnalyticsCalloutProps = {
  className?: string
}

export function StaffAnalyticsCallout({ className }: StaffAnalyticsCalloutProps) {
  const hasUrl = analyticsUrl !== ""

  return (
    <Card
      className={cn(
        "mb-8 border-border bg-card",
        hasUrl && "border-primary/25 bg-primary/[0.03]",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          サイトのアクセス状況（Vercel Analytics）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          訪問数・ページビュー・参照ページなどは、Vercel の Web Analytics で確認します。
          このサイト内にグラフを埋め込む公式機能はないため、下のボタンから管理画面を開いてください。
        </p>
        {hasUrl ? (
          <div className="space-y-3">
            <p className="text-xs font-mono text-foreground/80 break-all rounded-md border border-border bg-muted/40 px-3 py-2">
              {analyticsUrl}
            </p>
            <Button
              asChild
              className="w-full gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 sm:w-auto"
            >
              <Link href={analyticsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Vercel Analytics を開く（別タブ）
              </Link>
            </Button>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Vercel にログインし、当プロジェクトを見られる権限がある必要があります。</li>
              <li>閲覧できない関係者には、チーム招待または画面共有をご検討ください。</li>
            </ul>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
            管理者向け: 本番の環境変数に{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              NEXT_PUBLIC_VERCEL_ANALYTICS_URL
            </code>{" "}
            を設定すると、ここにボタンが表示されます（Vercel プロジェクトの Analytics
            ページの URL）。設定後は再デプロイが必要です。
          </p>
        )}
      </CardContent>
    </Card>
  )
}
