"use client"

import { useEffect, useMemo, useState } from "react"
import { sortStaffRecordsNewestFirst } from "@/lib/activity-records-sort"
import {
  type MatchRecord,
  mergeStaffRecordsFromServerAndLocal,
  normalizeMatchVideoUrls,
  normalizeTournamentRecords,
  STAFF_RECORDS_STORAGE_KEY,
  type TournamentRecord,
} from "@/lib/staff-records"
import { ClipboardCopy, Download, Lock, Plus, Save, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const defaultRecords: TournamentRecord[] = [
  {
    id: "spring-cup-r8-2026",
    year: "R8年度",
    name: "日の出ホルモンスプリングカップ",
    venue: "生目中学校",
    matches: [
      { id: "2026-04-04-1", date: "4/4", opponent: "本郷中学校", quarter: 4, ourScore: 45, theirScore: 30 },
      { id: "2026-04-04-2", date: "4/4", opponent: "東海中学校", quarter: 4, ourScore: 49, theirScore: 32 },
      { id: "2026-04-05-1", date: "4/5", opponent: "EPSIRON", quarter: 4, ourScore: 42, theirScore: 58 },
      { id: "2026-04-05-2", date: "4/5", opponent: "赤江東中学校", quarter: 4, ourScore: 49, theirScore: 48 },
    ],
  },
  {
    id: "practice-2026-04-18",
    year: "R8年度",
    name: "練習試合（4/18）",
    venue: "木花中学校",
    matches: [
      { id: "2026-04-18-1", date: "4/18", opponent: "木花中学校", quarter: 8, ourScore: 117, theirScore: 87 },
    ],
  },
  {
    id: "practice-2026-04-25",
    year: "R8年度",
    name: "練習試合（4/25）",
    venue: "日向学院高校",
    matches: [
      { id: "2026-04-25-1", date: "4/25", opponent: "日向学院高校", quarter: 4, ourScore: 63, theirScore: 34 },
      { id: "2026-04-25-2", date: "4/25", opponent: "タートル（社会人）", quarter: 4, ourScore: 37, theirScore: 86 },
    ],
  },
  {
    id: "practice-2026-04-29",
    year: "R8年度",
    name: "練習試合（4/29）",
    venue: "国光春中学校",
    matches: [
      { id: "2026-04-29-1", date: "4/29", opponent: "宮附中学校", quarter: 2, ourScore: 48, theirScore: 1 },
      { id: "2026-04-29-2", date: "4/29", opponent: "国光春中学校", quarter: 2, ourScore: 36, theirScore: 13 },
      { id: "2026-04-29-3", date: "4/29", opponent: "南郷中学校", quarter: 2, ourScore: 60, theirScore: 2 },
      { id: "2026-04-29-4", date: "4/29", opponent: "都農中学校", quarter: 2, ourScore: 37, theirScore: 10 },
      { id: "2026-04-29-5", date: "4/29", opponent: "日向中学校", quarter: 2, ourScore: 27, theirScore: 37 },
      { id: "2026-04-29-6", date: "4/29", opponent: "富田・高鍋東中学校", quarter: 2, ourScore: 40, theirScore: 7 },
      { id: "2026-04-29-7", date: "4/29", opponent: "野尻・飯野中学校", quarter: 2, ourScore: 39, theirScore: 10 },
    ],
  },
  {
    id: "practice-2026-05-02",
    year: "R8年度",
    name: "練習試合（5/2）",
    venue: "宮商高校",
    matches: [
      { id: "2026-05-02-1", date: "5/2", opponent: "宮商高校", quarter: 9, ourScore: 50, theirScore: 171 },
    ],
  },
  {
    id: "practice-2026-05-04",
    year: "R8年度",
    name: "練習試合（5/4）",
    venue: "祝吉中学校",
    matches: [
      { id: "2026-05-04-1", date: "5/4", opponent: "EPSIRON", quarter: 4, ourScore: 51, theirScore: 44 },
      { id: "2026-05-04-2", date: "5/4", opponent: "REDSUNS", quarter: 4, ourScore: 42, theirScore: 35 },
      { id: "2026-05-04-3", date: "5/4", opponent: "祝吉中学校", quarter: 2, ourScore: 56, theirScore: 22 },
      { id: "2026-05-04-4", date: "5/4", opponent: "ELPIS", quarter: 2, ourScore: 21, theirScore: 24 },
      { id: "2026-05-04-5", date: "5/4", opponent: "苅田中学校", quarter: 2, ourScore: 32, theirScore: 12 },
    ],
  },
  {
    id: "practice-2026-05-06",
    year: "R8年度",
    name: "練習試合（5/6）",
    venue: "宮崎市総合体育館",
    matches: [
      { id: "2026-05-06-1", date: "5/6", opponent: "CRISIS", quarter: 6, ourScore: 101, theirScore: 43 },
    ],
  },
  {
    id: "practice-2026-05-09",
    year: "R8年度",
    name: "練習試合（5/9）",
    venue: "生目台中学校",
    matches: [
      { id: "2026-05-09-1", date: "5/9", opponent: "清武中学校", quarter: 4, ourScore: 81, theirScore: 18 },
      { id: "2026-05-09-2", date: "5/9", opponent: "生目台中学校", quarter: 4, ourScore: 61, theirScore: 51 },
    ],
  },
]

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaultRecordsNormalized(): TournamentRecord[] {
  const normalized = defaultRecords.map((tournament) => ({
    ...tournament,
    matches: tournament.matches.map((match) => normalizeMatchVideoUrls({ ...match })),
  }))
  return sortStaffRecordsNewestFirst(normalized)
}

function loadInitialRecords() {
  if (typeof window === "undefined") return defaultRecordsNormalized()
  const raw = window.localStorage.getItem(STAFF_RECORDS_STORAGE_KEY)
  if (!raw) return defaultRecordsNormalized()
  try {
    const parsed = JSON.parse(raw) as (TournamentRecord & {
      videoUrls?: string[]
      videoRowCount?: number
      videoUrl?: string
    })[]
    if (!Array.isArray(parsed)) return defaultRecordsNormalized()
    const mapped = parsed.map((record) => {
      const legacyTournamentUrls = Array.isArray(record.videoUrls) ? [...record.videoUrls] : []
      const legacySingle =
        typeof record.videoUrl === "string" ? record.videoUrl.trim() : ""
      if (legacySingle !== "") legacyTournamentUrls.unshift(legacySingle)

      const { videoUrls: _drop, videoRowCount: _drop2, videoUrl: _drop3, ...rest } = record

      const matches = record.matches.map((match, index) => {
        let next = normalizeMatchVideoUrls(match)
        if (index === 0 && legacyTournamentUrls.length > 0) {
          const merged = [...(next.videoUrls ?? [])]
          const cap = Math.max(0, next.quarter)
          for (let i = 0; i < cap && i < legacyTournamentUrls.length; i++) {
            const slot = legacyTournamentUrls[i]?.trim() ?? ""
            if (slot !== "" && (merged[i] ?? "") === "") merged[i] = slot
          }
          next = { ...next, videoUrls: merged }
        }
        return normalizeMatchVideoUrls(next)
      })

      return { ...rest, matches } as TournamentRecord
    })
    return sortStaffRecordsNewestFirst(mapped)
  } catch {
    return defaultRecordsNormalized()
  }
}

type StaffResultsManagerProps = {
  /** 認証済みルート（/staff/results）では true。認証 UI を出さない */
  skipAuth?: boolean
}

export function StaffResultsManager({ skipAuth = false }: StaffResultsManagerProps) {
  const [isUnlocked, setIsUnlocked] = useState(() => skipAuth === true)
  const [codeInput, setCodeInput] = useState("")
  const [authError, setAuthError] = useState("")

  const [records, setRecords] = useState<TournamentRecord[]>(loadInitialRecords)

  const recordsOrdered = useMemo(() => sortStaffRecordsNewestFirst(records), [records])

  const [newTournament, setNewTournament] = useState({
    year: "",
    name: "",
    venue: "",
  })

  const [newMatch, setNewMatch] = useState({
    tournamentId: "",
    date: "",
    opponent: "",
    quarter: "",
    ourScore: "",
    theirScore: "",
  })
  const [videoDrafts, setVideoDrafts] = useState<Record<string, string[]>>({})
  const [syncStatus, setSyncStatus] = useState<"idle" | "ok" | "error">("idle")
  const [backupFeedback, setBackupFeedback] = useState("")
  const [importJsonText, setImportJsonText] = useState("")
  const [importError, setImportError] = useState("")

  const expectedCode = process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "123456"

  useEffect(() => {
    if (!isUnlocked) return
    window.localStorage.setItem(STAFF_RECORDS_STORAGE_KEY, JSON.stringify(recordsOrdered))
  }, [isUnlocked, recordsOrdered])

  useEffect(() => {
    if (!isUnlocked) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/staff-records", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { records?: TournamentRecord[] }
        if (!cancelled && Array.isArray(data.records) && data.records.length > 0) {
          setRecords((prev) =>
            sortStaffRecordsNewestFirst(mergeStaffRecordsFromServerAndLocal(data.records!, prev)),
          )
        }
      } catch {
        // 通信失敗時はローカル保存データを継続利用
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isUnlocked])

  useEffect(() => {
    if (!isUnlocked) return
    void (async () => {
      try {
        const res = await fetch("/api/staff-records", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: recordsOrdered }),
        })
        setSyncStatus(res.ok ? "ok" : "error")
      } catch {
        setSyncStatus("error")
      }
    })()
  }, [isUnlocked, recordsOrdered])

  const canAddTournament =
    newTournament.year.trim() !== "" && newTournament.name.trim() !== ""
  const canAddMatch =
    newMatch.tournamentId !== "" &&
    newMatch.date.trim() !== "" &&
    newMatch.opponent.trim() !== "" &&
    newMatch.quarter.trim() !== "" &&
    newMatch.ourScore.trim() !== "" &&
    newMatch.theirScore.trim() !== ""

  const totalMatches = useMemo(
    () => records.reduce((sum, tournament) => sum + tournament.matches.length, 0),
    [records],
  )

  const exportRecordsJsonStr = useMemo(() => JSON.stringify(recordsOrdered, null, 2), [recordsOrdered])

  const unlock = () => {
    if (codeInput.trim() === expectedCode) {
      setIsUnlocked(true)
      setAuthError("")
      return
    }
    setAuthError("アクセスコードが違います。")
  }

  const addTournament = () => {
    if (!canAddTournament) return
    const newRecord: TournamentRecord = {
      id: createId(),
      year: newTournament.year.trim(),
      name: newTournament.name.trim(),
      venue: newTournament.venue.trim(),
      matches: [],
    }
    setRecords((prev) => [...prev, newRecord])
    setNewTournament({ year: "", name: "", venue: "" })
    setNewMatch((prev) => ({ ...prev, tournamentId: newRecord.id }))
  }

  const addMatch = () => {
    if (!canAddMatch) return
    const quarter = Number(newMatch.quarter)
    const ourScore = Number(newMatch.ourScore)
    const theirScore = Number(newMatch.theirScore)
    if (Number.isNaN(quarter) || Number.isNaN(ourScore) || Number.isNaN(theirScore)) return

    const record: MatchRecord = {
      id: createId(),
      date: newMatch.date.trim(),
      opponent: newMatch.opponent.trim(),
      quarter,
      ourScore,
      theirScore,
      videoUrls: Array.from({ length: Math.max(0, quarter) }, () => ""),
    }

    setRecords((prev) =>
      prev.map((tournament) =>
        tournament.id === newMatch.tournamentId
          ? { ...tournament, matches: [...tournament.matches, record] }
          : tournament,
      ),
    )

    setNewMatch({
      tournamentId: newMatch.tournamentId,
      date: "",
      opponent: "",
      quarter: "",
      ourScore: "",
      theirScore: "",
    })
  }

  const updateTournamentField = (
    tournamentId: string,
    field: "year" | "name" | "venue",
    value: string,
  ) => {
    setRecords((prev) =>
      prev.map((tournament) =>
        tournament.id === tournamentId ? { ...tournament, [field]: value } : tournament,
      ),
    )
  }

  const updateMatchField = (
    tournamentId: string,
    matchId: string,
    field: "date" | "opponent" | "quarter" | "ourScore" | "theirScore",
    value: string,
  ) => {
    setRecords((prev) =>
      prev.map((tournament) =>
        tournament.id !== tournamentId
          ? tournament
          : {
              ...tournament,
              matches: tournament.matches.map((match) => {
                if (match.id !== matchId) return match
                if (field === "quarter" || field === "ourScore" || field === "theirScore") {
                  const numeric = Number(value)
                  const nextNum = Number.isNaN(numeric) ? 0 : numeric
                  if (field === "quarter") {
                    let urls = [...(match.videoUrls ?? [])]
                    while (urls.length < nextNum) urls.push("")
                    urls = urls.slice(0, nextNum)
                    return { ...match, quarter: nextNum, videoUrls: urls }
                  }
                  return {
                    ...match,
                    [field]: nextNum,
                  }
                }
                return { ...match, [field]: value }
              }),
            },
      ),
    )
  }

  const removeTournament = (tournamentId: string) => {
    const confirmed = window.confirm("この試合情報を削除します。よろしいですか？")
    if (!confirmed) return
    setRecords((prev) => {
      const next = prev.filter((tournament) => tournament.id !== tournamentId)
      setNewMatch((nm) => {
        if (nm.tournamentId !== tournamentId) return nm
        return { ...nm, tournamentId: sortStaffRecordsNewestFirst(next)[0]?.id ?? "" }
      })
      return next
    })
  }

  const removeMatch = (tournamentId: string, matchId: string) => {
    const confirmed = window.confirm("この試合記録を削除します。よろしいですか？")
    if (!confirmed) return
    setRecords((prev) =>
      prev.map((tournament) =>
        tournament.id !== tournamentId
          ? tournament
          : {
              ...tournament,
              matches: tournament.matches.filter((match) => match.id !== matchId),
            },
      ),
    )
    setVideoDrafts((prev) => {
      const next = { ...prev }
      delete next[matchId]
      return next
    })
  }

  const getMatchVideoDraftValue = (matchId: string, index: number, saved: string) =>
    videoDrafts[matchId]?.[index] ?? saved

  const setMatchVideoDraftValue = (matchId: string, index: number, value: string) => {
    setVideoDrafts((prev) => {
      const next = { ...prev }
      const current = [...(next[matchId] ?? [])]
      if (index >= current.length) {
        current.push(...Array(index - current.length + 1).fill(""))
      }
      current[index] = value
      next[matchId] = current
      return next
    })
  }

  const saveMatchVideoUrl = (tournamentId: string, matchId: string, index: number) => {
    const draft = (videoDrafts[matchId]?.[index] ?? "").trim()
    setRecords((prev) =>
      prev.map((tournament) => {
        if (tournament.id !== tournamentId) return tournament
        return {
          ...tournament,
          matches: tournament.matches.map((match) => {
            if (match.id !== matchId) return match
            const urls = [...(match.videoUrls ?? [])]
            while (urls.length <= index) urls.push("")
            urls[index] = draft
            return normalizeMatchVideoUrls({ ...match, videoUrls: urls })
          }),
        }
      }),
    )
    setVideoDrafts((prev) => {
      const next = { ...prev }
      const current = [...(next[matchId] ?? [])]
      while (current.length <= index) current.push("")
      current[index] = draft
      next[matchId] = current
      return next
    })
  }

  const clearMatchVideoUrlSlot = (tournamentId: string, matchId: string, index: number) => {
    const confirmed = window.confirm("この試合動画URLを削除します。よろしいですか？")
    if (!confirmed) return
    setRecords((prev) =>
      prev.map((tournament) => {
        if (tournament.id !== tournamentId) return tournament
        return {
          ...tournament,
          matches: tournament.matches.map((match) => {
            if (match.id !== matchId) return match
            const urls = [...(match.videoUrls ?? [])]
            while (urls.length <= index) urls.push("")
            urls[index] = ""
            return normalizeMatchVideoUrls({ ...match, videoUrls: urls })
          }),
        }
      }),
    )
    setVideoDrafts((prev) => {
      const next = { ...prev }
      const current = [...(next[matchId] ?? [])]
      while (current.length <= index) current.push("")
      current[index] = ""
      next[matchId] = current
      return next
    })
  }

  const showBackupMessage = (message: string) => {
    setBackupFeedback(message)
    window.setTimeout(() => setBackupFeedback(""), 8000)
  }

  const copyRecordsToClipboard = async () => {
    const text = exportRecordsJsonStr
    try {
      await navigator.clipboard.writeText(text)
      showBackupMessage("クリップボードにコピーしました。メモアプリやメールに貼り付けて共有できます。")
    } catch {
      showBackupMessage("自動コピーに失敗しました。下の「エクスポート用JSON」欄から手動でコピーしてください。")
    }
  }

  const downloadRecordsJson = () => {
    const text = exportRecordsJsonStr
    const blob = new Blob([text], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "staff-records.json"
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showBackupMessage("staff-records.json のダウンロードを開始しました（ファイルアプリに保存できます）。")
  }

  const applyImportedRecords = () => {
    setImportError("")
    try {
      const raw: unknown = JSON.parse(importJsonText)
      const arr = Array.isArray(raw) ? raw : (raw as { records?: unknown }).records
      if (!Array.isArray(arr)) {
        setImportError("JSON は大会の配列か、{ \"records\": [...] } の形にしてください。")
        return
      }
      const normalized = normalizeTournamentRecords(arr as TournamentRecord[])
      setRecords(sortStaffRecordsNewestFirst(normalized))
      showBackupMessage("取り込みました。内容を確認してください。")
    } catch {
      setImportError("JSON が壊れているか、形式が合いません。")
    }
  }

  const openMatchVideoUrl = (match: MatchRecord, index: number) => {
    const url = (match.videoUrls?.[index] ?? "").trim()
    if (url !== "") {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    const input = document.getElementById(`video-url-${match.id}-${index}`) as HTMLInputElement | null
    input?.focus()
  }

  if (!isUnlocked && !skipAuth) {
    return (
      <Card className="max-w-lg mx-auto border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lock className="h-6 w-6 text-primary" />
            関係者認証
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            このページはチーム関係者向けです。アクセスコードを入力してください。
          </p>
          <div className="space-y-2">
            <Label htmlFor="staff-code">アクセスコード</Label>
            <Input
              id="staff-code"
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="アクセスコードを入力"
            />
          </div>
          {authError !== "" ? (
            <p className="text-sm text-red-400">{authError}</p>
          ) : null}
          <Button className="w-full" onClick={unlock}>
            認証して入室
          </Button>
          <p className="text-xs text-muted-foreground">
            ※ 本番では `.env` の `NEXT_PUBLIC_STAFF_ACCESS_CODE` を必ず変更してください。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p>
              関係者専用ページです。試合情報をこのページから追加・編集できます。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl">全員に反映する（バックアップ・取り込み）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            試合動画の URL は、まずこの端末のブラウザ（Safari など）に保存されます。公開サイトの「大会参加・活動記録」に同じリンクを出すには、リポジトリの{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">data/staff-records.json</code>{" "}
            としてデプロイに含める必要があります（本番サーバーだけへの保存は環境によっては永続しません）。
          </p>
          <p className="text-foreground font-medium">手順の例（iPhone で入力済みの場合）</p>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>下の「JSONをコピー」またはファイル保存で、この端末のデータを取り出す。</li>
            <li>
              開発用 PC で{" "}
              <code className="rounded bg-muted px-1 text-xs">data/staff-records.json</code>{" "}
              を作成または差し替え、Git にコミットしてデプロイする。
            </li>
            <li>デプロイ後、全員のトップページの活動記録から動画リンクが開けることを確認する。</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void copyRecordsToClipboard()}>
              <ClipboardCopy className="h-4 w-4 mr-2" />
              JSONをコピー
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={downloadRecordsJson}>
              <Download className="h-4 w-4 mr-2" />
              JSONファイルを保存
            </Button>
          </div>
          {backupFeedback !== "" ? (
            <p className="text-sm text-primary font-medium">{backupFeedback}</p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="export-json-readonly">エクスポート用JSON（コピーしづいときはここから全選択）</Label>
            <Textarea
              id="export-json-readonly"
              readOnly
              rows={6}
              className="font-mono text-xs"
              value={exportRecordsJsonStr}
            />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <Label htmlFor="import-json">別端末から持ってきた JSON を貼り付け（上書き取り込み）</Label>
            <Textarea
              id="import-json"
              rows={5}
              className="font-mono text-xs"
              placeholder='[ { "id": "...", "year": "...", ... } ] または { "records": [ ... ] }'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
            />
            {importError !== "" ? <p className="text-sm text-red-400">{importError}</p> : null}
            <Button type="button" variant="secondary" size="sm" onClick={applyImportedRecords}>
              取り込む
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">大会を追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">年度</Label>
              <Input
                id="year"
                value={newTournament.year}
                onChange={(e) =>
                  setNewTournament((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="例: R8年度"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">大会名</Label>
              <Input
                id="name"
                value={newTournament.name}
                onChange={(e) =>
                  setNewTournament((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="例: 練習試合(⚪︎/⚪︎)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">会場（任意）</Label>
              <Input
                id="venue"
                value={newTournament.venue}
                onChange={(e) =>
                  setNewTournament((prev) => ({ ...prev, venue: e.target.value }))
                }
                placeholder="例: 宮崎市内"
              />
            </div>
            <Button onClick={addTournament} disabled={!canAddTournament} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              大会を追加
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">試合記録を追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tournament">対象大会</Label>
              <div className="flex gap-2">
                <select
                  id="tournament"
                  value={newMatch.tournamentId}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, tournamentId: e.target.value }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">大会を選択</option>
                  {recordsOrdered.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.year} / {record.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={newMatch.tournamentId === ""}
                  onClick={() => removeTournament(newMatch.tournamentId)}
                  className="text-red-500 hover:text-red-400 shrink-0"
                >
                  削除
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="match-date">日付</Label>
                <Input
                  id="match-date"
                  value={newMatch.date}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, date: e.target.value }))
                  }
                  placeholder="例: 4/21"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="match-opponent">対戦相手</Label>
                <Input
                  id="match-opponent"
                  value={newMatch.opponent}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, opponent: e.target.value }))
                  }
                  placeholder="例: 赤江東中"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="match-quarter">Q</Label>
                <Input
                  id="match-quarter"
                  type="number"
                  value={newMatch.quarter}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, quarter: e.target.value }))
                  }
                  placeholder="例: 4"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="our-score">自チーム得点</Label>
                <Input
                  id="our-score"
                  type="number"
                  value={newMatch.ourScore}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, ourScore: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="their-score">相手チーム得点</Label>
                <Input
                  id="their-score"
                  type="number"
                  value={newMatch.theirScore}
                  onChange={(e) =>
                    setNewMatch((prev) => ({ ...prev, theirScore: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button onClick={addMatch} disabled={!canAddMatch} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              試合記録を追加
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {recordsOrdered.map((record) => (
          <Card key={record.id} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">試合情報</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTournament(record.id)}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`year-${record.id}`}>年度</Label>
                  <Input
                    id={`year-${record.id}`}
                    value={record.year}
                    onChange={(e) =>
                      updateTournamentField(record.id, "year", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor={`name-${record.id}`}>大会名</Label>
                  <Input
                    id={`name-${record.id}`}
                    value={record.name}
                    onChange={(e) =>
                      updateTournamentField(record.id, "name", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`venue-${record.id}`}>会場</Label>
                <Input
                  id={`venue-${record.id}`}
                  value={record.venue}
                  onChange={(e) =>
                    updateTournamentField(record.id, "venue", e.target.value)
                  }
                />
              </div>

              {record.matches.length === 0 ? (
                <p className="text-muted-foreground">まだ試合記録はありません。</p>
              ) : (
                record.matches.map((match) => (
                  <div key={match.id} className="rounded-lg border border-border px-4 py-3 space-y-3">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMatch(record.id, match.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`date-${match.id}`}>日付</Label>
                        <Input
                          id={`date-${match.id}`}
                          value={match.date}
                          onChange={(e) =>
                            updateMatchField(record.id, match.id, "date", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`opponent-${match.id}`}>対戦相手</Label>
                        <Input
                          id={`opponent-${match.id}`}
                          value={match.opponent}
                          onChange={(e) =>
                            updateMatchField(
                              record.id,
                              match.id,
                              "opponent",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`quarter-${match.id}`}>Q</Label>
                        <Input
                          id={`quarter-${match.id}`}
                          type="number"
                          value={match.quarter}
                          onChange={(e) =>
                            updateMatchField(
                              record.id,
                              match.id,
                              "quarter",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`our-score-${match.id}`}>自チーム得点</Label>
                        <Input
                          id={`our-score-${match.id}`}
                          type="number"
                          value={match.ourScore}
                          onChange={(e) =>
                            updateMatchField(
                              record.id,
                              match.id,
                              "ourScore",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`their-score-${match.id}`}>相手チーム得点</Label>
                        <Input
                          id={`their-score-${match.id}`}
                          type="number"
                          value={match.theirScore}
                          onChange={(e) =>
                            updateMatchField(
                              record.id,
                              match.id,
                              "theirScore",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border pt-3">
                      <Label className="text-sm text-muted-foreground">
                        試合動画URL（Qの数だけ）
                      </Label>
                      {Array.from({ length: Math.max(0, match.quarter) }).map((_, vIndex) => (
                        <div
                          key={`${match.id}-video-${vIndex}`}
                          className="flex flex-wrap gap-2 items-center"
                        >
                          <Input
                            id={`video-url-${match.id}-${vIndex}`}
                            className="min-w-0 flex-1 basis-[min(100%,18rem)]"
                            value={getMatchVideoDraftValue(
                              match.id,
                              vIndex,
                              match.videoUrls?.[vIndex] ?? "",
                            )}
                            onChange={(e) =>
                              setMatchVideoDraftValue(match.id, vIndex, e.target.value)
                            }
                            placeholder={`試合動画URL ${vIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() =>
                              saveMatchVideoUrl(record.id, match.id, vIndex)
                            }
                          >
                            保存
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => openMatchVideoUrl(match, vIndex)}
                          >
                            開く
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-400 shrink-0"
                            onClick={() =>
                              clearMatchVideoUrlSlot(record.id, match.id, vIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            削除
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        入力した内容は自動保存されます。
      </p>
      {syncStatus === "error" ? (
        <p className="text-sm text-red-400 text-center">
          サーバー同期に失敗しました（この端末には保存済み）。管理者にお問い合わせください。
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground text-center">
        現在の登録件数: 大会 {records.length} 件 / 試合 {totalMatches} 件
      </p>
    </div>
  )
}
