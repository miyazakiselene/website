import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffResultsManager } from "@/components/staff-results-manager"
import { StaffSessionGuard } from "@/components/staff-session-guard"

export const metadata: Metadata = {
  title: "試合結果の管理 | 関係者専用 | 宮崎 SELENE",
  description: "試合記録・動画URLの管理（関係者専用）",
  robots: { index: false, follow: false },
}

export default function StaffResultsPage() {
  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">試合結果の管理</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          大会・試合の追加・編集と試合動画URLの登録はこのページのみで行います。
        </p>
      </header>
      <StaffResultsManager skipAuth />
    </StaffSessionGuard>
  )
}
