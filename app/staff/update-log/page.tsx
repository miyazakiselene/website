import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { readUpdateLogMarkdownForStaff } from "@/lib/update-log-storage"

export const metadata: Metadata = {
  title: "更新ログ | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "サイト変更履歴（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffUpdateLogPage() {
  const body = await readUpdateLogMarkdownForStaff()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">更新ログ</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Supabase の <code className="rounded bg-muted px-1.5 py-0.5 text-xs">site_update_log</code>{" "}
          に本文がある場合はそれを表示し、無い場合はリポジトリの{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">UPDATE_LOG.md</code>{" "}
          を表示します。
        </p>
      </header>
      <article className="rounded-xl border border-border bg-card/50 p-6 md:p-8">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
          {body}
        </pre>
      </article>
    </StaffSessionGuard>
  )
}
