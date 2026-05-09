import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { StaffResultsManager } from "@/components/staff-results-manager"

export const metadata: Metadata = {
  title: "関係者専用 | 宮崎 SELENE",
  description: "チーム関係者向けの大会・戦績管理ページです。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
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
            このページでは大会情報・対戦相手・点数の管理ができます。
            <br />
            公開ページには掲載しない内部情報の更新にご利用ください。
          </p>
        </header>

        <StaffResultsManager />
      </div>
    </main>
  )
}
