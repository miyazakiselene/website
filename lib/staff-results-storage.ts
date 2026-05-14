import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { normalizeTournamentRecords, type TournamentRecord } from "@/lib/staff-records"
import {
  isStaffResultsSupabaseEnabled,
  readStaffResultsSnapshotFromSupabase,
  writeStaffResultsSnapshotToSupabase,
} from "@/lib/staff-results-supabase"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "staff-records.json")

async function readFromFile(): Promise<TournamentRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw) as TournamentRecord[]
    if (!Array.isArray(parsed)) return []
    return normalizeTournamentRecords(parsed)
  } catch {
    return []
  }
}

/**
 * 試合結果の正本を読む。Supabase（URL + service_role）が有効なら DB を優先し、
 * 行が無い・records が null のときだけ data/staff-records.json にフォールバックする。
 */
export async function readStaffTournamentRecords(): Promise<TournamentRecord[]> {
  if (!isStaffResultsSupabaseEnabled()) {
    return readFromFile()
  }
  try {
    const fromDb = await readStaffResultsSnapshotFromSupabase()
    if (fromDb !== null) return fromDb
  } catch (e) {
    console.error("[readStaffTournamentRecords] Supabase read failed, falling back to file", e)
  }
  return readFromFile()
}

export async function writeStaffTournamentRecords(records: TournamentRecord[]): Promise<void> {
  const normalized = normalizeTournamentRecords(records)
  if (isStaffResultsSupabaseEnabled()) {
    await writeStaffResultsSnapshotToSupabase(normalized)
    return
  }
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(normalized, null, 2), "utf-8")
}
