import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffNewsForm } from "@/components/staff-news-form"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { readNewsRecords } from "@/lib/news"

export const metadata: Metadata = {
  title: "お知らせの管理 | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "トップページのお知らせを追加・修正・削除する（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffNewsPage() {
  const items = await readNewsRecords()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-foreground md:text-3xl">お知らせの管理</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          お知らせの追加に加え、一覧から修正・削除ができます。変更は data/news.json に保存され、トップへ反映されます（手元で{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm dev</code>{" "}
          を動かしているときのみ書き込み可能。Vercel 本番のみでは保存できません）。
        </p>
      </header>
      <StaffNewsForm initialItems={items} />
    </StaffSessionGuard>
  )
}
