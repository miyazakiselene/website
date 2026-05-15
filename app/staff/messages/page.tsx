import type { Metadata } from "next"
import { StaffAreaNav } from "@/components/staff-area-nav"
import { StaffMessagesManager } from "@/components/staff-messages-manager"
import { StaffSessionGuard } from "@/components/staff-session-guard"
import { isMessagesSupabaseEnabled } from "@/lib/messages-supabase"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "応援メッセージ管理 | 関係者専用 | 宮崎SELENE（セレーネ）",
  description: "応援メッセージの閲覧・削除・承認（関係者専用）",
  robots: { index: false, follow: false },
}

export default function StaffMessagesPage() {
  const supabaseReady = isMessagesSupabaseEnabled()

  return (
    <StaffSessionGuard>
      <StaffAreaNav />
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-foreground md:text-3xl">
          応援メッセージ
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {supabaseReady ? (
            <>
              公開ページから送信された応援メッセージを確認・削除・承認できます。
              承認フラグは将来の「承認済みのみ表示」機能のために使用します。
              保存先は <strong className="font-semibold text-foreground">Supabase</strong> の{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">messages</code> テーブルです。
            </>
          ) : (
            <>
              この機能は Supabase が設定されている場合にのみ使用できます。
              {" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> と{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              を設定してください。
            </>
          )}
        </p>
      </header>

      {supabaseReady ? (
        <StaffMessagesManager />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Supabase が未設定のため、この機能は利用できません。
          </p>
        </div>
      )}
    </StaffSessionGuard>
  )
}
