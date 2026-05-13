import "server-only"

import { randomUUID } from "node:crypto"
import { rename, unlink } from "node:fs/promises"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  dedupeActivitiesByIdFirstWins,
  normalizeActivityRecord,
  type ActivityRecord,
} from "@/lib/activities-model"
import { ACTIVITIES_MAX_ITEMS } from "@/lib/activities-validation"

export type { ActivityRecord } from "@/lib/activities-model"

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

/** 日付（新しい順）→ id のタイブレークで安定ソート */
export function sortActivitiesNewestFirst(items: ActivityRecord[]): ActivityRecord[] {
  return [...items].sort((a, b) => {
    const c = b.date.localeCompare(a.date)
    if (c !== 0) return c
    return b.id.localeCompare(a.id)
  })
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

export async function readActivityRecords(): Promise<ActivityRecord[]> {
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

export async function writeActivityRecords(items: ActivityRecord[]): Promise<void> {
  await runExclusiveActivitiesWrite(async () => {
    await writeActivitiesRecordsAtomic(sortActivitiesNewestFirst(finalizeRecords(items)))
  })
}

export async function appendActivityRecord(record: ActivityRecord): Promise<ActivityRecord[]> {
  return runExclusiveActivitiesWrite(async () => {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = sortActivitiesNewestFirst(finalizeRecords(await parseActivitiesFile(raw)))
    if (existing.length >= ACTIVITIES_MAX_ITEMS) {
      throw new Error(`ACTIVITIES_LIMIT: 活動記録は最大 ${ACTIVITIES_MAX_ITEMS} 件までです。`)
    }
    const next = sortActivitiesNewestFirst([...existing, record])
    await writeActivitiesRecordsAtomic(finalizeRecords(next))
    return finalizeRecords(next)
  })
}

export async function deleteActivityRecordById(id: string): Promise<ActivityRecord[]> {
  return runExclusiveActivitiesWrite(async () => {
    const raw = await fs.readFile(ACTIVITIES_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = finalizeRecords(await parseActivitiesFile(raw))
    const next = sortActivitiesNewestFirst(existing.filter((r) => r.id !== id))
    await writeActivitiesRecordsAtomic(next)
    return next
  })
}
