import "server-only"

import { randomUUID } from "node:crypto"
import { rename, unlink } from "node:fs/promises"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  appendActivityRecordSupabase,
  deleteActivityRecordByIdSupabase,
  isActivitiesSupabaseEnabled,
  readActivitiesFromSupabase,
  updateActivityRecordSupabase,
} from "@/lib/activities-supabase"
import {
  dedupeActivitiesByIdFirstWins,
  normalizeActivityRecord,
  sortActivitiesNewestFirst,
  type ActivityRecord,
} from "@/lib/activities-model"
import { ACTIVITIES_MAX_ITEMS } from "@/lib/activities-validation"

export type { ActivityRecord } from "@/lib/activities-model"
export { sortActivitiesNewestFirst } from "@/lib/activities-model"
export { isActivitiesSupabaseEnabled } from "@/lib/activities-supabase"

const ACTIVITIES_FILE = path.join(process.cwd(), "data", "activities.json")

let activitiesWriteChain: Promise<unknown> = Promise.resolve()

function runExclusiveActivitiesWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = activitiesWriteChain.then(task, task) as Promise<T>
  activitiesWriteChain = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

function finalizeRecords(raw: ActivityRecord[]): ActivityRecord[] {
  return dedupeActivitiesByIdFirstWins(raw)
}

async function parseActivitiesFile(raw: string): Promise<ActivityRecord[]> {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed) as unknown
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  const list = parsed.map(normalizeActivityRecord).filter((v): v is ActivityRecord => v !== null)
  return list
}

async function writeActivitiesRecordsAtomic(items: ActivityRecord[]): Promise<void> {
  const dir = path.dirname(ACTIVITIES_FILE)
  await fs.mkdir(dir, { recursive: true })
  const tmp = path.join(dir, `.activities-write-${randomUUID()}.tmp.json`)
  const payload = `${JSON.stringify(items, null, 2)}\n`
  await fs.writeFile(tmp, payload, "utf-8")
  try {
    await rename(tmp, ACTIVITIES_FILE)
  } catch {
    await fs.copyFile(tmp, ACTIVITIES_FILE)
    await unlink(tmp).catch(() => {})
  }
}

async function readActivityRecordsFromFile(): Promise<ActivityRecord[]> {
  try {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8")
    const list = await parseActivitiesFile(raw)
    return sortActivitiesNewestFirst(finalizeRecords(list))
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code
    if (code === "ENOENT") return []
    return []
  }
}

export async function readActivityRecords(): Promise<ActivityRecord[]> {
  if (isActivitiesSupabaseEnabled()) {
    try {
      return await readActivitiesFromSupabase()
    } catch (e) {
      console.error("[readActivityRecords] Supabase read failed, falling back to activities.json", e)
      return readActivityRecordsFromFile()
    }
  }
  return readActivityRecordsFromFile()
}

export async function writeActivityRecords(items: ActivityRecord[]): Promise<void> {
  if (isActivitiesSupabaseEnabled()) {
    throw new Error("writeActivityRecords は Supabase モードでは未対応です。")
  }
  await runExclusiveActivitiesWrite(async () => {
    await writeActivitiesRecordsAtomic(sortActivitiesNewestFirst(finalizeRecords(items)))
  })
}

export async function appendActivityRecord(record: ActivityRecord): Promise<ActivityRecord[]> {
  if (isActivitiesSupabaseEnabled()) {
    return runExclusiveActivitiesWrite(() => appendActivityRecordSupabase(record))
  }
  return runExclusiveActivitiesWrite(async () => {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = sortActivitiesNewestFirst(finalizeRecords(await parseActivitiesFile(raw)))
    if (existing.length >= ACTIVITIES_MAX_ITEMS) {
      throw new Error(`ACTIVITIES_LIMIT: 活動記録は最大 ${ACTIVITIES_MAX_ITEMS} 件までです。`)
    }
    const normalized = normalizeActivityRecord(record)
    if (normalized === null) {
      throw new Error("ACTIVITIES_INVALID")
    }
    const next = sortActivitiesNewestFirst([...existing, normalized])
    await writeActivitiesRecordsAtomic(finalizeRecords(next))
    return finalizeRecords(next)
  })
}

export async function deleteActivityRecordById(id: string): Promise<ActivityRecord[]> {
  if (isActivitiesSupabaseEnabled()) {
    return runExclusiveActivitiesWrite(() => deleteActivityRecordByIdSupabase(id))
  }
  return runExclusiveActivitiesWrite(async () => {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = finalizeRecords(await parseActivitiesFile(raw))
    if (!existing.some((r) => r.id === id)) {
      throw new Error("ACTIVITIES_NOT_FOUND")
    }
    const next = sortActivitiesNewestFirst(existing.filter((r) => r.id !== id))
    await writeActivitiesRecordsAtomic(next)
    return next
  })
}

export async function updateActivityRecord(record: ActivityRecord): Promise<ActivityRecord[]> {
  if (isActivitiesSupabaseEnabled()) {
    return runExclusiveActivitiesWrite(() => updateActivityRecordSupabase(record))
  }
  return runExclusiveActivitiesWrite(async () => {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = finalizeRecords(await parseActivitiesFile(raw))
    const idx = existing.findIndex((r) => r.id === record.id)
    if (idx === -1) {
      throw new Error("ACTIVITIES_NOT_FOUND")
    }
    const normalized = normalizeActivityRecord(record)
    if (normalized === null) {
      throw new Error("ACTIVITIES_INVALID")
    }
    const next = [...existing]
    next[idx] = normalized
    const finalized = finalizeRecords(sortActivitiesNewestFirst(next))
    await writeActivitiesRecordsAtomic(finalized)
    return finalized
  })
}
