import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import {
  approveMessageById,
  deleteMessageById,
  isMessagesSupabaseEnabled,
} from "@/lib/messages-supabase"

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

function checkAuth(request: Request): boolean {
  const auth = request.headers.get("authorization") ?? ""
  const code = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  return staffCodeMatches(code)
}

/** 管理者: メッセージ物理削除 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 })
  }
  if (!isMessagesSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 })
  }
  const { id } = await params
  try {
    await deleteMessageById(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === "MESSAGE_NOT_FOUND") {
      return NextResponse.json({ error: "メッセージが見つかりません。" }, { status: 404 })
    }
    console.error("[DELETE /api/messages/[id]]", error)
    return NextResponse.json({ error: "削除に失敗しました。" }, { status: 500 })
  }
}

/** 管理者: 承認フラグを true に切り替え（将来の公開機能用） */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 })
  }
  if (!isMessagesSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 })
  }
  const { id } = await params
  try {
    await approveMessageById(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === "MESSAGE_NOT_FOUND") {
      return NextResponse.json({ error: "メッセージが見つかりません。" }, { status: 404 })
    }
    console.error("[PATCH /api/messages/[id]]", error)
    return NextResponse.json({ error: "承認に失敗しました。" }, { status: 500 })
  }
}
