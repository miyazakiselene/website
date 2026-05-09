"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, Plus, Save, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type MatchRecord = {
  id: string
  date: string
  opponent: string
  ourScore: number
  theirScore: number
}

type TournamentRecord = {
  id: string
  year: string
  name: string
  venue: string
  matches: MatchRecord[]
}

const STORAGE_KEY = "selene-staff-results-v1"

const defaultRecords: TournamentRecord[] = [
  {
    id: "spring-cup-r8",
    year: "R8年度",
    name: "日の出ホルモンスプリングカップ",
    venue: "宮崎市内",
    matches: [
      { id: "m1", date: "4/13", opponent: "本郷中", ourScore: 45, theirScore: 30 },
      { id: "m2", date: "4/14", opponent: "東海中", ourScore: 49, theirScore: 32 },
      { id: "m3", date: "4/20", opponent: "EPSIRON", ourScore: 42, theirScore: 58 },
      { id: "m4", date: "4/21", opponent: "赤江東中", ourScore: 49, theirScore: 48 },
    ],
  },
]

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadInitialRecords() {
  if (typeof window === "undefined") return defaultRecords
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultRecords
  try {
    const parsed = JSON.parse(raw) as TournamentRecord[]
    return Array.isArray(parsed) ? parsed : defaultRecords
  } catch {
    return defaultRecords
  }
}

export function StaffResultsManager() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [authError, setAuthError] = useState("")

  const [records, setRecords] = useState<TournamentRecord[]>(loadInitialRecords)

  const [newTournament, setNewTournament] = useState({
    year: "",
    name: "",
    venue: "",
  })

  const [newMatch, setNewMatch] = useState({
    tournamentId: "",
    date: "",
    opponent: "",
    ourScore: "",
    theirScore: "",
  })

  const expectedCode = process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "selene-staff"

  useEffect(() => {
    if (!isUnlocked) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [isUnlocked, records])

  const canAddTournament =
    newTournament.year.trim() !== "" && newTournament.name.trim() !== ""
  const canAddMatch =
    newMatch.tournamentId !== "" &&
    newMatch.date.trim() !== "" &&
    newMatch.opponent.trim() !== "" &&
    newMatch.ourScore.trim() !== "" &&
    newMatch.theirScore.trim() !== ""

  const totalMatches = useMemo(
    () => records.reduce((sum, tournament) => sum + tournament.matches.length, 0),
    [records],
  )

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
    const ourScore = Number(newMatch.ourScore)
    const theirScore = Number(newMatch.theirScore)
    if (Number.isNaN(ourScore) || Number.isNaN(theirScore)) return

    const record: MatchRecord = {
      id: createId(),
      date: newMatch.date.trim(),
      opponent: newMatch.opponent.trim(),
      ourScore,
      theirScore,
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
      ourScore: "",
      theirScore: "",
    })
  }

  if (!isUnlocked) {
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
              関係者専用ページです。大会情報と試合記録をこのページから追加できます。
            </p>
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
                placeholder="例: 日の出ホルモンスプリングカップ"
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
              <select
                id="tournament"
                value={newMatch.tournamentId}
                onChange={(e) =>
                  setNewMatch((prev) => ({ ...prev, tournamentId: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">大会を選択</option>
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.year} / {record.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
        {records.map((record) => (
          <Card key={record.id} className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">
                {record.year} / {record.name}
              </CardTitle>
              {record.venue !== "" ? (
                <p className="text-muted-foreground">{record.venue}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {record.matches.length === 0 ? (
                <p className="text-muted-foreground">まだ試合記録はありません。</p>
              ) : (
                record.matches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-lg border border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="text-sm md:text-base">
                      <span className="text-muted-foreground mr-3">{match.date}</span>
                      <span className="font-medium">vs {match.opponent}</span>
                    </div>
                    <div className="font-bold text-lg">
                      {match.ourScore} - {match.theirScore}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        現在の登録件数: 大会 {records.length} 件 / 試合 {totalMatches} 件
      </p>
    </div>
  )
}
