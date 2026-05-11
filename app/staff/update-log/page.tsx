import type { Metadata } from "next"
import { promises as fs } from "node:fs"
import path from "node:path"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffSessionGuard } from "@/components/staff-session-guard"

export const metadata: Metadata = {
  title: "更新ログ | 関係者専用 | 宮崎 SELENE",
  description: "サイト変更履歴（関係者専用）",
  robots: { index: false, follow: false },
}

export default async function StaffUpdateLogPage() {
  const filePath = path.join(process.cwd(), "UPDATE_LOG.md")
  let body = ""
  try {
    body = await fs.readFile(filePath, "utf-8")
  } catch {
    body = "UPDATE_LOG.md が見つかりません。"
  }

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">更新ログ</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          リポジトリの <code className="rounded bg-muted px-1.5 py-0.5 text-xs">UPDATE_LOG.md</code>{" "}
          と同じ内容です。変更が入るたびに追記されます。
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
