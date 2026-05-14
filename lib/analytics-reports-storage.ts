import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import type { AnalyticsReportJson } from "@/lib/analytics-series"
import {
  isAnalyticsReportsSupabaseEnabled,
  readAnalyticsReportsPayloadFromSupabase,
} from "@/lib/analytics-reports-supabase"

const DATA_FILE = path.join(process.cwd(), "data", "vercel-analytics-reports.json")

function normalizeReportsList(raw: unknown): AnalyticsReportJson[] {
  if (!Array.isArray(raw)) return []
  return raw as AnalyticsReportJson[]
}

async function readFromFile(): Promise<AnalyticsReportJson[]> {
  try {
    const text = await fs.readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(text) as unknown
    if (Array.isArray(parsed)) {
      return normalizeReportsList(parsed)
    }
    if (typeof parsed === "object" && parsed !== null && "reports" in parsed) {
      return normalizeReportsList((parsed as { reports?: unknown }).reports)
    }
    return []
  } catch {
    return []
  }
}

/**
 * ダッシュボード用レポート一覧。Supabase が有効なら DB を優先し、空でない配列が得られたらそれを返す。
 * それ以外は data/vercel-analytics-reports.json を読む。
 */
export async function readAnalyticsReportsForStaff(): Promise<AnalyticsReportJson[]> {
  if (!isAnalyticsReportsSupabaseEnabled()) {
    return readFromFile()
  }
  try {
    const fromDb = await readAnalyticsReportsPayloadFromSupabase()
    if (fromDb !== null && fromDb.length > 0) {
      return normalizeReportsList(fromDb)
    }
  } catch (e) {
    console.error("[readAnalyticsReportsForStaff] Supabase read failed, falling back to file", e)
  }
  return readFromFile()
}
