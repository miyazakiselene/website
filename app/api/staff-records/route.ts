import { promises as fs } from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { normalizeMatchVideoUrls, type TournamentRecord } from "@/lib/staff-records"

export const runtime = "nodejs"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "staff-records.json")

function normalizeRecords(records: TournamentRecord[]): TournamentRecord[] {
  return records.map((record) => ({
    ...record,
    venue: record.venue ?? "",
    matches: (record.matches ?? []).map((match) => normalizeMatchVideoUrls(match)),
  }))
}

async function readRecordsFile(): Promise<TournamentRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw) as TournamentRecord[]
    if (!Array.isArray(parsed)) return []
    return normalizeRecords(parsed)
  } catch {
    return []
  }
}

export async function GET() {
  const records = await readRecordsFile()
  return NextResponse.json({ records })
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { records?: TournamentRecord[] }
    const records = Array.isArray(body.records) ? normalizeRecords(body.records) : null
    if (!records) {
      return NextResponse.json({ error: "records is required" }, { status: 400 })
    }
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf-8")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "failed to save records" }, { status: 500 })
  }
}
