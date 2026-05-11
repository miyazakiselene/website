import type { Metadata } from "next"
import { StaffAnalyticsCallout } from "@/components/staff-analytics-callout"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"

export const metadata: Metadata = {
  title: "ダッシュボード | 関係者専用 | 宮崎 SELENE",
  description: "サイトアクセス状況の確認（関係者専用）",
  robots: { index: false, follow: false },
}

export default function StaffDashboardPage() {
  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          本サイトの訪問状況を Vercel Web Analytics で確認するためのページです。
          試合結果・動画URLの編集は「試合結果」から行ってください。
        </p>
      </header>
      <StaffAnalyticsCallout className="mb-0" />
    </StaffSessionGuard>
  )
}
