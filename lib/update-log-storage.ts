import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  isSiteUpdateLogSupabaseEnabled,
  readSiteUpdateLogBodyFromSupabase,
} from "@/lib/site-update-log-supabase"

const UPDATE_LOG_PATH = path.join(process.cwd(), "UPDATE_LOG.md")

async function readFromFile(): Promise<string> {
  try {
    return await fs.readFile(UPDATE_LOG_PATH, "utf-8")
  } catch {
    return "UPDATE_LOG.md が見つかりません。"
  }
}

/**
 * 更新ログ本文。Supabase が有効で DB に本文があればそれを返し、それ以外は UPDATE_LOG.md。
 */
export async function readUpdateLogMarkdownForStaff(): Promise<string> {
  if (!isSiteUpdateLogSupabaseEnabled()) {
    return readFromFile()
  }
  try {
    const fromDb = await readSiteUpdateLogBodyFromSupabase()
    if (fromDb !== null && fromDb.trim().length > 0) {
      return fromDb
    }
  } catch (e) {
    console.error("[readUpdateLogMarkdownForStaff] Supabase read failed, falling back to file", e)
  }
  return readFromFile()
}
