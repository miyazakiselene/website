#!/usr/bin/env node
/**
 * Vercel Analytics PDF → data/vercel-analytics-reports.json 自動取り込みスクリプト
 *
 * 使い方:
 *   node scripts/ingest-analytics.mjs [PDF のパス]
 *   ※ パス省略時は data/analytics-inbox/ 内の最新 PDF を自動検出
 *
 *   package.json に追加した場合:
 *   pnpm analytics:ingest
 *   pnpm analytics:ingest path/to/file.pdf
 */

import { execSync } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const pdfParse = require("pdf-parse")

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT        = path.join(__dirname, "..")
const INBOX_DIR   = path.join(ROOT, "data", "analytics-inbox")
const PROCESSED_DIR = path.join(ROOT, "data", "analytics-processed")
const JSON_FILE   = path.join(ROOT, "data", "vercel-analytics-reports.json")

// ── ユーティリティ ──────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0] // YYYY-MM-DD
}

async function findLatestInboxPdf() {
  const files = await fs.readdir(INBOX_DIR)
  const pdfs  = files.filter((f) => f.toLowerCase().endsWith(".pdf"))
  if (pdfs.length === 0) return null
  pdfs.sort() // 辞書順（ファイル名に日付が入っている場合に有効）
  return path.join(INBOX_DIR, pdfs[pdfs.length - 1])
}

// ── PDF テキスト抽出 ────────────────────────────────────────────────────────

async function extractText(pdfPath) {
  const buf  = await fs.readFile(pdfPath)
  const data = await pdfParse(buf)
  return data.text
}

// ── テキスト解析 ────────────────────────────────────────────────────────────
// Vercel Analytics PDF の文字列フォーマット（スクリーンショット → PDF 出力）に合わせた正規表現

function parseInt10(s) {
  const n = parseInt(String(s).replace(/[^\d]/g, ""), 10)
  return isNaN(n) ? 0 : n
}

function parsePdf(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const raw   = lines.join("\n")

  // ─ サマリー数値 ───────────────────────────────────────────────────────────
  const visitorsMatch   = raw.match(/Visitors\s+(\d+)/)
  const pageViewsMatch  = raw.match(/Page Views[^\n]*\n(\d[\d,]*)/)
  const bounceMatch     = raw.match(/(\d+)%\s*(?:[+-]\d+%)?\s*\n?(?:.*?)?Bounce Rate|Bounce Rate\s+(\d+)%/)

  const visitors   = visitorsMatch  ? parseInt10(visitorsMatch[1])  : 0
  const pageViews  = pageViewsMatch ? parseInt10(pageViewsMatch[1]) : 0
  const bounceRate = bounceMatch    ? parseInt10(bounceMatch[1] ?? bounceMatch[2]) : 0

  // ─ 対象期間 ───────────────────────────────────────────────────────────────
  const periodMatch    = raw.match(/Last\s+(\d+)\s+Days/)
  const analysisPeriod = periodMatch
    ? `直近${periodMatch[1]}日間（PDF: Last ${periodMatch[1]} Days）`
    : "直近7日間（PDF: Last 7 Days）"

  // ─ ページ別訪問者数 ────────────────────────────────────────────────────────
  // 形式: "/path\n数字" または "/ 数字" など
  const pageRows = []
  const pageSectionMatch = raw.match(/(?:Pages|Routes)[^\n]*VISITORS([\s\S]*?)(?:Referrers|$)/)
  if (pageSectionMatch) {
    const block = pageSectionMatch[1]
    const lineArr = block.split("\n").map((l) => l.trim()).filter(Boolean)
    for (let i = 0; i < lineArr.length; i++) {
      const pathLine  = lineArr[i]
      const countLine = lineArr[i + 1]
      if (/^\//.test(pathLine) && /^\d+$/.test(countLine ?? "")) {
        pageRows.push({ path: pathLine, count: parseInt10(countLine) })
        i++ // 次行は消費済み
      } else if (/^\/\S*\s+\d+$/.test(pathLine)) {
        // "/ 55" の形式
        const [p, c] = pathLine.split(/\s+/)
        pageRows.push({ path: p, count: parseInt10(c) })
      }
    }
  }

  // ─ 参照元 ────────────────────────────────────────────────────────────────
  const referrers = []
  const refMatch = raw.match(/Referrers[^\n]*VISITORS([\s\S]*?)(?:Countries|$)/)
  if (refMatch) {
    const block    = refMatch[1]
    const lineArr  = block.split("\n").map((l) => l.trim()).filter(Boolean)
    for (let i = 0; i < lineArr.length; i++) {
      const label = lineArr[i]
      const val   = lineArr[i + 1]
      if (label && /^\d+$/.test(val ?? "")) {
        const domainLike = /^[\w.-]+\.\w{2,}/.test(label) || label.includes(".")
        if (domainLike) {
          referrers.push({ label, value: val })
          i++
        }
      }
    }
  }

  // ─ デバイス ───────────────────────────────────────────────────────────────
  const devices = []
  const mobileMatch  = raw.match(/Mobile\s+(\d+)%/)
  const desktopMatch = raw.match(/Desktop\s+(\d+)%/)
  if (mobileMatch)  devices.push({ label: "スマートフォン（モバイル）", value: `${mobileMatch[1]}%` })
  if (desktopMatch) devices.push({ label: "パソコン（デスクトップ）",   value: `${desktopMatch[1]}%` })

  // ─ OS ────────────────────────────────────────────────────────────────────
  const osList = []
  const iosMatch     = raw.match(/iOS\s+(\d+)%/)
  const macMatch     = raw.match(/Mac\s+(\d+)%/)
  const androidMatch = raw.match(/Android\s+(\d+)%/)
  const winMatch     = raw.match(/Windows\s+(\d+)%/)
  if (iosMatch)     osList.push({ label: "iOS（iPhone など）", value: `${iosMatch[1]}%` })
  if (macMatch)     osList.push({ label: "Mac",               value: `${macMatch[1]}%` })
  if (androidMatch) osList.push({ label: "Android",           value: `${androidMatch[1]}%` })
  if (winMatch)     osList.push({ label: "Windows",           value: `${winMatch[1]}%` })

  // ─ ページ行にラベルを付与 ─────────────────────────────────────────────────
  const labelMap = {
    "/":                  "トップページ",
    "/staff":             "関係者ページ（入り口）",
    "/staff/results":     "試合結果の管理",
    "/staff/dashboard":   "関係者ダッシュボード",
    "/staff/news":        "お知らせ管理",
    "/staff/activities":  "活動記録の管理",
    "/admin/team-images": "管理画面（チーム画像）",
  }
  const tableRows = pageRows.map((r) => ({
    label: labelMap[r.path] ?? r.path,
    path:  r.path,
    count: String(r.count),
  }))

  return {
    visitors,
    pageViews: pageViews || tableRows.reduce((s, r) => s + parseInt10(r.count), 0),
    bounceRate,
    analysisPeriod,
    tableRows,
    referrers,
    devices,
    osList,
  }
}

// ── JSON エントリ生成 ────────────────────────────────────────────────────────

function buildEntry(parsed, snapshotDate, existingCount) {
  const n = existingCount + 1
  const suffix = n === 1 ? "" : `・${n}回目`
  return {
    snapshotDate,
    exportTitle:   `サイトの訪問状況（やさしいまとめ）${suffix}`,
    dataSourceNote:
      `Vercel Web Analytics の画面を PDF に書き出したデータを読み取り整理しています（${snapshotDate} 取り込み）。`,
    analysisPeriod: parsed.analysisPeriod,
    deployment:    "Production（本番の公開サイト）",
    targetSite:    "miyazaki-selene.vercel.app",
    stats: {
      uniqueVisitors:     parsed.visitors,
      bouncePercent:      parsed.bounceRate,
      pageViewsEstimate:  parsed.pageViews,
    },
    metrics: [
      {
        title:    "訪問した人の数",
        subtitle: "同じ人が何回きても「1人」と数えます（Visitors）",
        value:    String(parsed.visitors),
        unit:     "人",
      },
      {
        title:    "直帰率",
        subtitle: "1ページだけ見てすぐ離脱した割合（Bounce Rate）",
        value:    String(parsed.bounceRate),
        unit:     "%",
      },
      {
        title:    "ページビュー（全体）",
        subtitle: "7日間のページ読み込み合計（Page Views）",
        value:    String(parsed.pageViews),
        unit:     "回",
      },
    ],
    pageTable: {
      caption:      "ページ別の閲覧人数（PDF の Pages / Routes の VISITORS 列）",
      columnLabels: ["ページの説明", "パス", "人数"],
      rows:         parsed.tableRows,
    },
    ...(parsed.referrers.length > 0 && {
      referrers: {
        caption:      "どのサイトから来たか（参照元）",
        columnLabels: ["参照元", "人数"],
        rows:         parsed.referrers,
      },
    }),
    countries: {
      caption:      "国・地域",
      columnLabels: ["地域", "割合"],
      rows:         [{ label: "日本", value: "100%" }],
    },
    ...(parsed.devices.length > 0 && {
      devices: {
        caption:      "使われた端末の種類",
        columnLabels: ["端末", "割合"],
        rows:         parsed.devices,
      },
    }),
    ...(parsed.osList.length > 0 && {
      operatingSystems: {
        caption:      "OSの種類",
        columnLabels: ["OS", "割合"],
        rows:         parsed.osList,
      },
    }),
  }
}

// ── メイン ──────────────────────────────────────────────────────────────────

async function main() {
  const argPdf = process.argv[2]
  const pdfPath = argPdf ?? await findLatestInboxPdf()

  if (!pdfPath) {
    console.error("エラー: data/analytics-inbox/ に PDF が見つかりません。")
    console.error("使い方: node scripts/ingest-analytics.mjs [path/to/file.pdf]")
    process.exit(1)
  }

  console.log(`📄 PDF を読み込み中: ${path.basename(pdfPath)}`)

  const text   = await extractText(pdfPath)
  const parsed = parsePdf(text)

  console.log(`✅ 解析結果: 訪問者 ${parsed.visitors}人 / PV ${parsed.pageViews}回 / 直帰率 ${parsed.bounceRate}%`)

  // snapshotDate: PDF ファイル名に日付があれば採用、なければ今日
  const dateFromName = path.basename(pdfPath).match(/(\d{4}-\d{2}-\d{2})/)
  const snapshotDate = dateFromName ? dateFromName[1] : today()

  // 既存 JSON を読み込み
  const existing = JSON.parse(await fs.readFile(JSON_FILE, "utf-8"))
  const reports  = Array.isArray(existing.reports) ? existing.reports : []

  // 同一 snapshotDate が既にあれば上書き、なければ追加
  const idx = reports.findIndex((r) => r.snapshotDate === snapshotDate)
  const entry = buildEntry(parsed, snapshotDate, reports.length)

  if (idx >= 0) {
    console.log(`♻️  ${snapshotDate} の既存エントリを更新します。`)
    reports[idx] = entry
  } else {
    reports.push(entry)
    console.log(`➕ ${snapshotDate} のエントリを追加しました（計 ${reports.length} 件）。`)
  }

  // 日付順にソート
  reports.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))

  await fs.writeFile(JSON_FILE, JSON.stringify({ reports }, null, 2) + "\n", "utf-8")
  console.log("💾 data/vercel-analytics-reports.json を更新しました。")

  // 処理済みフォルダへ移動（inbox にある場合のみ）
  if (!argPdf) {
    await fs.mkdir(PROCESSED_DIR, { recursive: true })
    const dest = path.join(PROCESSED_DIR, path.basename(pdfPath))
    await fs.rename(pdfPath, dest)
    console.log(`📦 処理済みフォルダへ移動: ${path.basename(dest)}`)
  }

  // git commit & push
  try {
    const commitMsg = `data(analytics): ${snapshotDate} Vercel Analytics を記録（訪問者${parsed.visitors}人・PV${parsed.pageViews}回）`
    execSync(`git -C "${ROOT}" add data/vercel-analytics-reports.json`, { stdio: "inherit" })
    if (argPdf === undefined) {
      execSync(`git -C "${ROOT}" add data/analytics-inbox data/analytics-processed`, { stdio: "pipe" })
    }
    execSync(`git -C "${ROOT}" commit -m "${commitMsg}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`, { stdio: "inherit" })
    execSync(`git -C "${ROOT}" push origin main`, { stdio: "inherit" })
    console.log("🚀 GitHub へプッシュ完了。")
  } catch (e) {
    console.error("⚠️  git commit/push に失敗しました:", e.message)
  }

  console.log("✨ 完了！")
}

main().catch((e) => { console.error(e); process.exit(1) })
