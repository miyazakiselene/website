import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { StaffEntry } from "@/components/staff-entry"

export const metadata: Metadata = {
  title: "関係者専用 | 宮崎SELENE（セレーネ）",
  description: "チーム関係者向けの試合・戦績管理ページです。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function StaffPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        トップページに戻る
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
          チーム関係者専用ページ
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          アクセスコード認証後、お知らせ・活動記録・試合結果の管理とアクセス分析用のダッシュボードをそれぞれ別ページから開けます。
        </p>
      </header>

      <StaffEntry />
    </>
  )
}
