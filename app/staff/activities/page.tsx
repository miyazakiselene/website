import type { Metadata } from "next"
import { StaffActivitiesManager } from "@/components/staff-activities-manager"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { isActivitiesSupabaseEnabled, readActivityRecords } from "@/lib/activities"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "活動記録の管理 | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "トップページの活動記録を追加・削除する（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffActivitiesPage() {
  const items = await readActivityRecords()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-foreground md:text-3xl">活動記録の管理</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isActivitiesSupabaseEnabled() ? (
            <>
              開始日・終了日・タイトル・場所・内容・対戦相手を登録すると{" "}
              <strong className="font-semibold text-foreground">Supabase</strong>{" "}
              に保存され、トップの活動記録に反映されます（本番の Vercel からも保存可能）。1日のみのときは終了日は空欄で構いません。
            </>
          ) : (
            <>
              開始日・終了日（任意）・タイトル・場所・内容・対戦相手を登録すると{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/activities.json</code>{" "}
              に保存され、トップの活動記録に反映されます。1日のみのときは終了日は空欄で構いません。Supabase
              を有効にすると本番からも保存できます。
            </>
          )}
        </p>
      </header>
      <StaffActivitiesManager initialItems={items} supabaseEnabled={isActivitiesSupabaseEnabled()} />
    </StaffSessionGuard>
  )
}
