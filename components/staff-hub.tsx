"use client"

import Link from "next/link"
import { BarChart3, ClipboardList, ScrollText } from "lucide-react"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function StaffHub() {
  return (
    <div className="space-y-10">
      <StaffAreaNav />
      <p className="text-center text-muted-foreground text-sm md:text-base">
        行き先を選んでください。試合結果の編集とアクセス分析は別ページです。
      </p>

      <div className="flex flex-col gap-10 md:gap-12">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <ClipboardList className="h-6 w-6 text-primary" />
              試合結果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              大会・試合の記録、得点、試合動画URLの登録・編集を行います。
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/staff/results">試合結果のページへ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <BarChart3 className="h-6 w-6 text-primary" />
              ダッシュボード
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              サイト訪問状況（Vercel Web Analytics）への導線です。試合データの編集は含みません。
            </p>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/staff/dashboard">ダッシュボードのページへ</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/staff/update-log"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <ScrollText className="h-4 w-4" />
            サイトの更新ログを見る
          </Link>
        </p>
      </div>
    </div>
  )
}
