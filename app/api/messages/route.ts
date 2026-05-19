import { timingSafeEqual } from "node:crypto"
import { after } from "next/server"
import { NextResponse } from "next/server"
import {
  insertMessage,
  isMessagesSupabaseEnabled,
  listMessages,
  MESSAGE_CONTENT_MAX,
  MESSAGE_NICKNAME_MAX,
} from "@/lib/messages-supabase"
import { sendCheerMessageNotification } from "@/lib/notification-email"

export const runtime = "nodejs"

function getExpectedStaffCode(): string {
  return (process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "123456").trim()
}

function staffCodeMatches(input: string): boolean {
  const expected  = getExpectedStaffCode()
  const candidate = input.trim()
  if (expected.length === 0 || candidate.length === 0) return false
  try {
    const a = Buffer.from(expected,  "utf8")
    const b = Buffer.from(candidate, "utf8")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** 管理者: 全メッセージ一覧取得 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? ""
  const code = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!staffCodeMatches(code)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 })
  }
  if (!isMessagesSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 })
  }
  try {
    const messages = await listMessages()
    return NextResponse.json(
      { messages },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    )
  } catch (error) {
    console.error("[GET /api/messages]", error)
    return NextResponse.json({ error: "メッセージの取得に失敗しました。" }, { status: 500 })
  }
}

/** 公開: 応援メッセージ投稿 */
export async function POST(request: Request) {
  if (!isMessagesSupabaseEnabled()) {
    return NextResponse.json({ error: "現在この機能は無効です。" }, { status: 503 })
  }
  try {
    const body     = await request.json()
    const nickname = typeof body.nickname === "string" ? body.nickname.trim() : ""
    const content  = typeof body.content  === "string" ? body.content.trim()  : ""

    if (nickname.length === 0 || nickname.length > MESSAGE_NICKNAME_MAX) {
      return NextResponse.json(
        { error: `ニックネームは1〜${MESSAGE_NICKNAME_MAX}文字で入力してください。` },
        { status: 400 },
      )
    }
    if (content.length === 0 || content.length > MESSAGE_CONTENT_MAX) {
      return NextResponse.json(
        { error: `メッセージは1〜${MESSAGE_CONTENT_MAX}文字で入力してください。` },
        { status: 400 },
      )
    }

    await insertMessage(nickname, content)
    after(() => sendCheerMessageNotification(nickname, content))
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/messages]", error)
    return NextResponse.json(
      { error: "メッセージの送信に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 },
    )
  }
}
