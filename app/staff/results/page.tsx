import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffResultsManager } from "@/components/staff-results-manager"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import type { TournamentRecord } from "@/lib/staff-records"
import { isStaffResultsSupabaseEnabled } from "@/lib/staff-results-supabase"
import { readStaffTournamentRecords } from "@/lib/staff-results-storage"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "試合結果の管理 | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "試合記録・動画URLの管理（関係者専用）",
  robots: { index: false, follow: false },
}

async function readInitialStaffRecords(): Promise<TournamentRecord[] | undefined> {
  const records = await readStaffTournamentRecords()
  return records.length === 0 ? undefined : records
}

export default async function StaffResultsPage() {
  const initialRecords = await readInitialStaffRecords()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-foreground md:text-3xl">試合結果の管理</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isStaffResultsSupabaseEnabled() ? (
            <>
              大会・試合の追加・編集と試合動画URLの登録はこのページで行います。保存先は{" "}
              <strong className="font-semibold text-foreground">Supabase</strong>{" "}
              です（本番の Vercel からも同期が保存されます）。ブラウザのローカル保存と自動同期を併用しています。
            </>
          ) : (
            <>
              大会・試合の追加・編集と試合動画URLの登録はこのページで行います。保存先は{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/staff-records.json</code>{" "}
              です。Supabase を有効にすると本番環境からの保存も安定します。
            </>
          )}
        </p>
      </header>
      <StaffResultsManager skipAuth initialRecords={initialRecords} supabaseEnabled={isStaffResultsSupabaseEnabled()} />
    </StaffSessionGuard>
  )
}
