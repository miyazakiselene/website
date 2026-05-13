import "server-only"

import { randomUUID } from "node:crypto"
import { rename, unlink } from "node:fs/promises"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  dedupeNewsRecordsByIdFirstWins,
  normalizeNewsRecord,
  type NewsRecord,
} from "@/lib/news-model"
import { NEWS_MAX_ITEMS } from "@/lib/news-validation"

export type { NewsRecord } from "@/lib/news-model"
export { getNewsArchiveThreshold, partitionNewsByArchiveThreshold } from "@/lib/news-model"

const NEWS_FILE = path.join(process.cwd(), "data", "news.json")

/** 同一プロセス内の news.json 更新を直列化（読み取り→追記→書き込みの競合を防ぐ） */
let newsWriteChain: Promise<unknown> = Promise.resolve()

function runExclusiveNewsWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = newsWriteChain.then(task, task) as Promise<T>
  newsWriteChain = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

function finalizeRecords(raw: NewsRecord[]): NewsRecord[] {
  return dedupeNewsRecordsByIdFirstWins(raw)
}

async function parseNewsFile(raw: string): Promise<NewsRecord[]> {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed) as unknown
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.map(normalizeNewsRecord).filter((v): v is NewsRecord => v !== null)
}

async function writeNewsRecordsAtomic(items: NewsRecord[]): Promise<void> {
  const dir = path.dirname(NEWS_FILE)
  await fs.mkdir(dir, { recursive: true })
  const tmp = path.join(dir, `.news-write-${randomUUID()}.tmp.json`)
  const payload = `${JSON.stringify(items, null, 2)}\n`
  await fs.writeFile(tmp, payload, "utf-8")
  try {
    await rename(tmp, NEWS_FILE)
  } catch {
    await fs.copyFile(tmp, NEWS_FILE)
    await unlink(tmp).catch(() => {})
  }
}

export async function readNewsRecords(): Promise<NewsRecord[]> {
  try {
    const raw = await fs.readFile(NEWS_FILE, "utf-8")
    const list = await parseNewsFile(raw)
    return finalizeRecords(list)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code
    if (code === "ENOENT") return []
    return []
  }
}

export async function writeNewsRecords(items: NewsRecord[]): Promise<void> {
  await runExclusiveNewsWrite(async () => {
    await writeNewsRecordsAtomic(finalizeRecords(items))
  })
}

export async function appendNewsRecord(record: NewsRecord): Promise<NewsRecord[]> {
  return runExclusiveNewsWrite(async () => {
    const raw = await fs.readFile(NEWS_FILE, "utf-8").catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return "[]"
      throw e
    })
    const existing = finalizeRecords(await parseNewsFile(raw))
    if (existing.length >= NEWS_MAX_ITEMS) {
      throw new Error(`NEWS_LIMIT: お知らせは最大 ${NEWS_MAX_ITEMS} 件までです。`)
    }
    const next = [...existing, record]
    await writeNewsRecordsAtomic(finalizeRecords(next))
    return finalizeRecords(next)
  })
}
