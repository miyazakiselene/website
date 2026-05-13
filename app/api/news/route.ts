import { randomUUID, timingSafeEqual } from "node:crypto"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { appendNewsRecord, readNewsRecords, type NewsRecord } from "@/lib/news"

export const runtime = "nodejs"

function getExpectedStaffCode(): string {
  return (process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "123456").trim()
}

function staffCodeMatches(input: string): boolean {
  const expected = getExpectedStaffCode()
  const candidate = input.trim()
  if (expected.length === 0 || candidate.length === 0) return false
  try {
    const a = Buffer.from(expected, "utf8")
    const b = Buffer.from(candidate, "utf8")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function GET() {
  const items = await readNewsRecords()
  return NextResponse.json({ items })
}

type PostBody = {
  accessCode?: string
  title?: string
  date?: string
  content?: string
  venue?: string
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = parseISO(value)
  return !Number.isNaN(d.getTime()) && format(d, "yyyy-MM-dd") === value
}

export async function POST(request: Request) {
  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!staffCodeMatches(String(body.accessCode ?? ""))) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  const title = String(body.title ?? "").trim()
  const dateIso = String(body.date ?? "").trim()
  const content = String(body.content ?? "").trim()
  const venue = String(body.venue ?? "").trim() || "詳細未定"

  if (title.length === 0) {
    return NextResponse.json({ error: "タイトルを入力してください。" }, { status: 400 })
  }
  if (!isValidIsoDate(dateIso)) {
    return NextResponse.json({ error: "日付は YYYY-MM-DD 形式で入力してください。" }, { status: 400 })
  }

  const parsed = parseISO(dateIso)
  const displayDate = format(parsed, "yyyy年M月d日", { locale: ja })

  const record: NewsRecord = {
    id: `news-${randomUUID()}`,
    date: displayDate,
    title,
    venue,
    content: content.length > 0 ? content : undefined,
    eventEndDate: dateIso,
  }

  const items = await appendNewsRecord(record)
  revalidatePath("/")
  revalidatePath("/staff/news")

  return NextResponse.json({ ok: true, items })
}
