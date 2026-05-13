import { randomUUID, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import {
  appendNewsRecord,
  deleteNewsRecordById,
  readNewsRecords,
  updateNewsRecord,
} from "@/lib/news"
import type { NewsRecord } from "@/lib/news-model"
import { formatActivityPeriodHeading } from "@/lib/map-activities-to-tournaments"
import { revalidatePathsSafe } from "@/lib/safe-revalidate"
import {
  NEWS_CONTENT_MAX,
  NEWS_JSON_BODY_MAX_BYTES,
  newsDeleteBodySchema,
  newsPatchBodySchema,
  newsPostBodySchema,
} from "@/lib/news-validation"
import { errorToDetailString, persistJsonFilesystemUserMessage } from "@/lib/persist-json-fs-message"

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
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  )
}

function buildNewsRecordWithId(
  id: string,
  input: {
    title: string
    startDate: string
    endDate: string
    content?: string
    venue?: string
  },
): NewsRecord {
  const venue = (input.venue ?? "").trim() || "詳細未定"
  const contentRaw = input.content?.trim() ?? ""
  const eventStartDate = input.startDate
  const eventEndDate = input.endDate
  return {
    id,
    date: formatActivityPeriodHeading(eventStartDate, eventEndDate),
    title: input.title.trim(),
    venue,
    content: contentRaw.length > 0 ? contentRaw.slice(0, NEWS_CONTENT_MAX) : undefined,
    eventStartDate,
    eventEndDate,
  }
}

export async function POST(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > NEWS_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = newsPostBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((issue) => issue.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  const record = buildNewsRecordWithId(`news-${randomUUID()}`, {
    title: parsed.data.title,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    content: parsed.data.content,
    venue: parsed.data.venue,
  })

  try {
    const items = await appendNewsRecord(record)
    revalidatePathsSafe(["/", "/staff/news"])
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.startsWith("NEWS_LIMIT")) {
      return NextResponse.json({ error: "お知らせの登録上限に達しています。" }, { status: 413 })
    }
    if (message === "NEWS_INVALID") {
      return NextResponse.json({ error: "保存内容が無効です。日付と会場を確認してください。" }, { status: 400 })
    }
    const fsMsg = persistJsonFilesystemUserMessage(error)
    if (fsMsg) {
      console.error("[api/news POST]", error)
      return NextResponse.json({ error: fsMsg, detail: errorToDetailString(error) }, { status: 503 })
    }
    console.error("[api/news POST]", error)
    return NextResponse.json(
      {
        error: "保存に失敗しました。しばらくしてから再度お試しください。",
        detail: errorToDetailString(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > NEWS_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = newsPatchBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((issue) => issue.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  const record = buildNewsRecordWithId(parsed.data.id, {
    title: parsed.data.title,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    content: parsed.data.content,
    venue: parsed.data.venue,
  })

  try {
    const items = await updateNewsRecord(record)
    revalidatePathsSafe(["/", "/staff/news"])
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === "NEWS_NOT_FOUND") {
      return NextResponse.json({ error: "指定のお知らせが見つかりません。" }, { status: 404 })
    }
    if (message === "NEWS_INVALID") {
      return NextResponse.json({ error: "保存内容が無効です。" }, { status: 400 })
    }
    const fsMsg = persistJsonFilesystemUserMessage(error)
    if (fsMsg) {
      console.error("[api/news PATCH]", error)
      return NextResponse.json({ error: fsMsg, detail: errorToDetailString(error) }, { status: 503 })
    }
    console.error("[api/news PATCH]", error)
    return NextResponse.json(
      {
        error: "保存に失敗しました。しばらくしてから再度お試しください。",
        detail: errorToDetailString(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > NEWS_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = newsDeleteBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((issue) => issue.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  try {
    const items = await deleteNewsRecordById(parsed.data.id)
    revalidatePathsSafe(["/", "/staff/news"])
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === "NEWS_NOT_FOUND") {
      return NextResponse.json({ error: "指定のお知らせが見つかりません。" }, { status: 404 })
    }
    const fsMsg = persistJsonFilesystemUserMessage(error)
    if (fsMsg) {
      console.error("[api/news DELETE]", error)
      return NextResponse.json({ error: fsMsg, detail: errorToDetailString(error) }, { status: 503 })
    }
    console.error("[api/news DELETE]", error)
    return NextResponse.json(
      {
        error: "削除に失敗しました。しばらくしてから再度お試しください。",
        detail: errorToDetailString(error),
      },
      { status: 500 },
    )
  }
}
