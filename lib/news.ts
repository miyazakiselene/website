import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { normalizeNewsRecord, type NewsRecord } from "@/lib/news-model"

export type { NewsRecord } from "@/lib/news-model"
export { getNewsArchiveThreshold, partitionNewsByArchiveThreshold } from "@/lib/news-model"

const NEWS_FILE = path.join(process.cwd(), "data", "news.json")

export async function readNewsRecords(): Promise<NewsRecord[]> {
  try {
    const raw = await fs.readFile(NEWS_FILE, "utf-8")
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeNewsRecord).filter((v): v is NewsRecord => v !== null)
  } catch {
    return []
  }
}

export async function writeNewsRecords(items: NewsRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(NEWS_FILE), { recursive: true })
  await fs.writeFile(NEWS_FILE, JSON.stringify(items, null, 2), "utf-8")
}

export async function appendNewsRecord(record: NewsRecord): Promise<NewsRecord[]> {
  const existing = await readNewsRecords()
  const next = [...existing, record]
  await writeNewsRecords(next)
  return next
}
