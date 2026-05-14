#!/usr/bin/env node
/**
 * data/analytics-inbox/ を監視し、PDF が置かれたら自動で ingest-analytics.mjs を実行します。
 *
 * 起動: node scripts/watch-analytics.mjs
 *       pnpm analytics:watch
 *
 * 終了: Ctrl+C
 */

import { watch }         from "node:fs"
import { execFileSync }  from "node:child_process"
import { existsSync }    from "node:fs"
import path              from "node:path"
import { fileURLToPath } from "node:url"

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const INBOX_DIR  = path.join(__dirname, "..", "data", "analytics-inbox")
const INGEST     = path.join(__dirname, "ingest-analytics.mjs")

console.log("👀 監視中: data/analytics-inbox/")
console.log("   PDF をこのフォルダに置くと自動で処理されます。終了: Ctrl+C\n")

// 連続イベントの重複実行を防ぐ（同じファイルが短時間に複数イベントを発火する）
const processing = new Set()

watch(INBOX_DIR, (eventType, filename) => {
  if (!filename || !filename.toLowerCase().endsWith(".pdf")) return
  if (processing.has(filename)) return

  const fullPath = path.join(INBOX_DIR, filename)
  if (!existsSync(fullPath)) return

  processing.add(filename)

  console.log(`\n📥 新しい PDF を検出: ${filename}`)
  try {
    execFileSync(process.execPath, [INGEST, fullPath], { stdio: "inherit" })
  } catch (e) {
    console.error("❌ 取り込みに失敗しました:", e.message)
  }

  // 5 秒後に再処理を許可
  setTimeout(() => processing.delete(filename), 5000)
})
