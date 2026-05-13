import { randomUUID, timingSafeEqual } from "node:crypto"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  appendActivityRecord,
  deleteActivityRecordById,
  readActivityRecords,
  updateActivityRecord,
} from "@/lib/activities"
import type { ActivityRecord } from "@/lib/activities-model"
import {
  ACTIVITIES_JSON_BODY_MAX_BYTES,
  activityDeleteBodySchema,
  activityPatchBodySchema,
  activityPostBodySchema,
} from "@/lib/activities-validation"

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
  const items = await readActivityRecords()
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  )
}

function buildActivityRecordWithId(
  id: string,
  input: {
    startDate: string
    endDate: string
    title: string
    location: string
    content?: string
    opponent: string
  },
): ActivityRecord {
  return {
    id,
    startDate: input.startDate,
    endDate: input.endDate,
    title: input.title.trim(),
    location: input.location.trim(),
    content: (input.content ?? "").trim(),
    opponent: input.opponent.trim(),
  }
}

export async function POST(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > ACTIVITIES_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = activityPostBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  const record = buildActivityRecordWithId(`activity-${randomUUID()}`, {
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    title: parsed.data.title,
    location: parsed.data.location,
    content: parsed.data.content,
    opponent: parsed.data.opponent,
  })

  try {
    const items = await appendActivityRecord(record)
    revalidatePath("/")
    revalidatePath("/staff/activities")
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.startsWith("ACTIVITIES_LIMIT")) {
      return NextResponse.json({ error: "活動記録の登録上限に達しています。" }, { status: 413 })
    }
    if (message === "ACTIVITIES_INVALID") {
      return NextResponse.json({ error: "保存内容が無効です。日付・対戦相手・タイトルを確認してください。" }, { status: 400 })
    }
    return NextResponse.json({ error: "保存に失敗しました。しばらくしてから再度お試しください。" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > ACTIVITIES_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = activityPatchBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  const record = buildActivityRecordWithId(parsed.data.id, {
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    title: parsed.data.title,
    location: parsed.data.location,
    content: parsed.data.content,
    opponent: parsed.data.opponent,
  })

  try {
    const items = await updateActivityRecord(record)
    revalidatePath("/")
    revalidatePath("/staff/activities")
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "ACTIVITIES_NOT_FOUND") {
      return NextResponse.json({ error: "指定の活動記録が見つかりません。" }, { status: 404 })
    }
    if (message === "ACTIVITIES_INVALID") {
      return NextResponse.json({ error: "保存内容が無効です。" }, { status: 400 })
    }
    return NextResponse.json({ error: "保存に失敗しました。しばらくしてから再度お試しください。" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  let buf: ArrayBuffer
  try {
    buf = await request.arrayBuffer()
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました。" }, { status: 400 })
  }

  if (buf.byteLength > ACTIVITIES_JSON_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  let json: unknown
  try {
    json = JSON.parse(new TextDecoder("utf-8").decode(buf)) as unknown
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 })
  }

  const parsed = activityDeleteBodySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ")
    return NextResponse.json({ error: msg || "入力内容を確認してください。" }, { status: 400 })
  }

  if (!staffCodeMatches(parsed.data.accessCode)) {
    return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
  }

  try {
    const items = await deleteActivityRecordById(parsed.data.id)
    revalidatePath("/")
    revalidatePath("/staff/activities")
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "ACTIVITIES_NOT_FOUND") {
      return NextResponse.json({ error: "指定の活動記録が見つかりません。" }, { status: 404 })
    }
    return NextResponse.json({ error: "削除に失敗しました。しばらくしてから再度お試しください。" }, { status: 500 })
  }
}
