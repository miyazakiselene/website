import type { Metadata } from "next"
import { StaffAnalyticsReports } from "@/components/staff-analytics-reports"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { readAnalyticsReportsForStaff } from "@/lib/analytics-reports-storage"

export const metadata: Metadata = {
  title: "ダッシュボード | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "サイトアクセス状況の確認（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffDashboardPage() {
  const reports = await readAnalyticsReportsForStaff()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          本サイトへのアクセスを、PDF から読み取った数字をもとに表で確認できます。Supabase を有効にしている場合は{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">analytics_reports_snapshot</code>{" "}
          を優先し、未設定時は{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/vercel-analytics-reports.json</code>{" "}
          を参照します。試合結果の編集は「試合結果」から行ってください。
        </p>
      </header>
      <StaffAnalyticsReports reports={reports} />
    </StaffSessionGuard>
  )
}
