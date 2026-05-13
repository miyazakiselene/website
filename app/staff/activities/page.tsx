import type { Metadata } from "next"
import { StaffActivitiesManager } from "@/components/staff-activities-manager"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { readActivityRecords } from "@/lib/activities"

export const metadata: Metadata = {
  title: "活動記録の管理 | 関係者専用 | 宮崎 SELENE",
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
          開始日・終了日（任意）・タイトル・場所・内容・対戦相手を登録すると data/activities.json に保存され、トップの活動記録に反映されます。1日のみのときは終了日は空欄で構いません。
        </p>
      </header>
      <StaffActivitiesManager initialItems={items} />
    </StaffSessionGuard>
  )
}
