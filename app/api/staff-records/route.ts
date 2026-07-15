import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { errorToDetailString, persistJsonFilesystemUserMessage } from "@/lib/persist-json-fs-message"
import { revalidatePathsSafe } from "@/lib/safe-revalidate"
import { normalizeTournamentRecords, type TournamentRecord } from "@/lib/staff-records"
import { readStaffTournamentRecords, writeStaffTournamentRecords } from "@/lib/staff-results-storage"

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
  const records = await readStaffTournamentRecords()
  return NextResponse.json(
    { records },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  )
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { accessCode?: string; records?: TournamentRecord[] }
    if (!staffCodeMatches(typeof body.accessCode === "string" ? body.accessCode : "")) {
      return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
    }
    const records = Array.isArray(body.records) ? normalizeTournamentRecords(body.records) : null
    if (!records) {
      return NextResponse.json({ error: "records is required" }, { status: 400 })
    }
    await writeStaffTournamentRecords(records)
    revalidatePathsSafe(["/", "/staff/results"])
    return NextResponse.json({ ok: true })
  } catch (error) {
    const fsMsg = persistJsonFilesystemUserMessage(error)
    if (fsMsg) {
      console.error("[api/staff-records PUT]", error)
      return NextResponse.json({ error: fsMsg, detail: errorToDetailString(error) }, { status: 503 })
    }
    console.error("[api/staff-records PUT]", error)
    return NextResponse.json(
      {
        error: "試合結果の保存に失敗しました。しばらくしてから再度お試しください。",
        detail: errorToDetailString(error),
      },
      { status: 500 },
    )
  }
}
