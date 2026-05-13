import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffNewsForm } from "@/components/staff-news-form"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { readNewsRecords } from "@/lib/news"

export const metadata: Metadata = {
  title: "お知らせの投稿 | 関係者専用 | 宮崎 SELENE",
  description: "トップページのお知らせを追加する（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffNewsPage() {
  const items = await readNewsRecords()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-foreground md:text-3xl">お知らせの投稿</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          タイトル・日付・内容を入力すると、ローカルの JSON に保存され、トップのお知らせへ反映されます。
        </p>
      </header>
      <StaffNewsForm initialCount={items.length} />
    </StaffSessionGuard>
  )
}
