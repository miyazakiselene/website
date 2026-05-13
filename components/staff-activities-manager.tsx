"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, Pencil, Trash2 } from "lucide-react"
import {
  formatActivityDateRangeJa,
  formatOpponentsDisplayJa,
  joinOpponentLinesForStorage,
  opponentStoredToFormLines,
  type ActivityRecord,
} from "@/lib/activities-model"
import {
  ACTIVITIES_CONTENT_MAX,
  ACTIVITIES_LOCATION_MAX,
  ACTIVITIES_OPPONENT_LINE_MAX,
  ACTIVITIES_STAFF_RECENT_MANAGE_COUNT,
  ACTIVITIES_TITLE_MAX,
} from "@/lib/activities-validation"
import { getStaffApiAccessCode } from "@/lib/staff-session"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type StaffActivitiesManagerProps = {
  initialItems: ActivityRecord[]
}

const fetchJsonTimeoutMs = 30_000

function updateOpponentLines(lines: string[], index: number, value: string): string[] {
  const next = [...lines]
  next[index] = value
  const last = next.length - 1
  if (value.trim() !== "" && index === last) {
    next.push("")
  }
  return next
}

export function StaffActivitiesManager({ initialItems }: StaffActivitiesManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<ActivityRecord[]>(initialItems)
  const recentManaged = useMemo(
    () => items.slice(0, ACTIVITIES_STAFF_RECENT_MANAGE_COUNT),
    [items],
  )

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [content, setContent] = useState("")
  const [opponentLines, setOpponentLines] = useState<string[]>([""])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editOpponentLines, setEditOpponentLines] = useState<string[]>([""])
  const [pendingEdit, setPendingEdit] = useState(false)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const beginEdit = (row: ActivityRecord) => {
    setError("")
    setMessage("")
    setEditingId(row.id)
    setEditStartDate(row.startDate)
    setEditEndDate(row.startDate === row.endDate ? "" : row.endDate)
    setEditTitle(row.title)
    setEditLocation(row.location)
    setEditContent(row.content)
    setEditOpponentLines(opponentStoredToFormLines(row.opponent))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditStartDate("")
    setEditEndDate("")
    setEditTitle("")
    setEditLocation("")
    setEditContent("")
    setEditOpponentLines([""])
  }

  const submit = async () => {
    setError("")
    setMessage("")
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。一度ログアウトして、関係者ページから再度認証してください。")
      return
    }
    if (startDate.trim() === "") {
      setError("開始日を入力してください。")
      return
    }
    const effectiveEnd = endDate.trim() === "" ? startDate : endDate.trim()
    if (effectiveEnd < startDate) {
      setError("終了日は開始日以降にしてください。")
      return
    }

    const opponentJoined = joinOpponentLinesForStorage(opponentLines)
    if (opponentJoined.length === 0) {
      setError("対戦相手を1チーム以上入力してください。")
      return
    }

    setPending(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          title,
          startDate,
          endDate: endDate.trim() === "" ? undefined : endDate.trim(),
          location: location.trim(),
          content,
          opponent: opponentJoined,
        }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: ActivityRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: ActivityRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "保存に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(data.items)
      setMessage("活動記録を保存しました。")
      setStartDate("")
      setEndDate("")
      setTitle("")
      setLocation("")
      setContent("")
      setOpponentLines([""])
      router.refresh()
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("通信がタイムアウトしました。ネットワークを確認して再度お試しください。")
      } else {
        setError("通信に失敗しました。")
      }
    } finally {
      window.clearTimeout(timeoutId)
      setPending(false)
    }
  }

  const submitEdit = async () => {
    if (editingId == null) return
    setError("")
    setMessage("")
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。")
      return
    }
    if (editStartDate.trim() === "") {
      setError("開始日を入力してください。")
      return
    }
    const effectiveEnd = editEndDate.trim() === "" ? editStartDate : editEndDate.trim()
    if (effectiveEnd < editStartDate) {
      setError("終了日は開始日以降にしてください。")
      return
    }

    const editOpponentJoined = joinOpponentLinesForStorage(editOpponentLines)
    if (editOpponentJoined.length === 0) {
      setError("対戦相手を1チーム以上入力してください。")
      return
    }

    setPendingEdit(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/activities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          id: editingId,
          title: editTitle,
          startDate: editStartDate,
          endDate: editEndDate.trim() === "" ? undefined : editEndDate.trim(),
          location: editLocation.trim(),
          content: editContent,
          opponent: editOpponentJoined,
        }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: ActivityRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: ActivityRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "更新に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(data.items)
      setMessage("活動記録を更新しました。")
      cancelEdit()
      router.refresh()
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("通信がタイムアウトしました。")
      } else {
        setError("通信に失敗しました。")
      }
    } finally {
      window.clearTimeout(timeoutId)
      setPendingEdit(false)
    }
  }

  const remove = async (id: string) => {
    const confirmed = window.confirm("この活動記録を削除します。よろしいですか？")
    if (!confirmed) return
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。")
      return
    }
    setError("")
    setMessage("")
    setDeletingId(id)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/activities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode, id }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: ActivityRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: ActivityRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "削除に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(data.items)
      setMessage("削除しました。")
      if (editingId === id) cancelEdit()
      router.refresh()
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("通信がタイムアウトしました。")
      } else {
        setError("通信に失敗しました。")
      }
    } finally {
      window.clearTimeout(timeoutId)
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-10">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <ClipboardList className="h-6 w-6 text-primary" />
            活動記録を追加
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            入力内容は <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/activities.json</code>{" "}
            に保存され、トップの活動記録セクションに反映されます。複数日にまたがる場合は終了日を指定してください（1日のみのときは終了日は空欄で構いません）。
          </p>
          <p className="text-xs text-muted-foreground">現在の登録件数: {items.length} 件</p>

          {message ? (
            <Alert>
              <AlertTitle>完了</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activity-start-date">開始日</Label>
              <Input
                id="activity-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-end-date">終了日（任意・1日のみなら空欄）</Label>
              <Input
                id="activity-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-title">タイトル</Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 練習試合"
              autoComplete="off"
              maxLength={ACTIVITIES_TITLE_MAX}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-location">場所（任意）</Label>
            <Input
              id="activity-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 宮崎市総合体育館"
              autoComplete="off"
              maxLength={ACTIVITIES_LOCATION_MAX}
            />
          </div>
          <div className="space-y-2">
            <Label>対戦相手（1行に1チーム。入力すると次の行が追加されます）</Label>
            <div className="space-y-2">
              {opponentLines.map((line, index) => (
                <Input
                  key={`opp-add-${index}`}
                  id={index === 0 ? "activity-opponent-0" : undefined}
                  aria-label={`対戦相手 ${index + 1}`}
                  value={line}
                  onChange={(e) =>
                    setOpponentLines((prev) => updateOpponentLines(prev, index, e.target.value))
                  }
                  placeholder={index === 0 ? "例: ○○中学校" : "続けて入力"}
                  autoComplete="off"
                  maxLength={ACTIVITIES_OPPONENT_LINE_MAX}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-content">内容（任意）</Label>
            <Textarea
              id="activity-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="メモ・詳細など"
              maxLength={ACTIVITIES_CONTENT_MAX}
            />
          </div>

          <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={() => void submit()}>
            {pending ? "送信中…" : "活動記録を登録"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">登録済みの活動記録（直近{ACTIVITIES_STAFF_RECENT_MANAGE_COUNT}件）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            終了日が新しい順の先頭 {ACTIVITIES_STAFF_RECENT_MANAGE_COUNT}{" "}
            件だけ、ここから修正・削除できます。
            {items.length > ACTIVITIES_STAFF_RECENT_MANAGE_COUNT ? (
              <span className="block pt-1">
                それ以外（{items.length - ACTIVITIES_STAFF_RECENT_MANAGE_COUNT}{" "}
                件）は <code className="rounded bg-muted px-1 py-0.5 text-xs">data/activities.json</code>{" "}
                を直接編集するか、不要なものを削除してからこの一覧に載せてください。
              </span>
            ) : null}
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ登録がありません。</p>
          ) : (
            <ul className="space-y-3">
              {recentManaged.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/80 bg-secondary/20 p-4 md:p-5"
                >
                  {editingId === row.id ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-start-${row.id}`}>開始日</Label>
                          <Input
                            id={`edit-start-${row.id}`}
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-end-${row.id}`}>終了日（1日のみなら空欄）</Label>
                          <Input
                            id={`edit-end-${row.id}`}
                            type="date"
                            value={editEndDate}
                            min={editStartDate || undefined}
                            onChange={(e) => setEditEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-title-${row.id}`}>タイトル</Label>
                        <Input
                          id={`edit-title-${row.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={ACTIVITIES_TITLE_MAX}
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-loc-${row.id}`}>場所（任意）</Label>
                        <Input
                          id={`edit-loc-${row.id}`}
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          maxLength={ACTIVITIES_LOCATION_MAX}
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>対戦相手（1行に1チーム）</Label>
                        <div className="space-y-2">
                          {editOpponentLines.map((line, index) => (
                            <Input
                              key={`opp-edit-${row.id}-${index}`}
                              aria-label={`対戦相手 ${index + 1}`}
                              value={line}
                              onChange={(e) =>
                                setEditOpponentLines((prev) =>
                                  updateOpponentLines(prev, index, e.target.value),
                                )
                              }
                              placeholder={index === 0 ? "例: ○○中学校" : "続けて入力"}
                              maxLength={ACTIVITIES_OPPONENT_LINE_MAX}
                              autoComplete="off"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-content-${row.id}`}>内容（任意）</Label>
                        <Textarea
                          id={`edit-content-${row.id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          maxLength={ACTIVITIES_CONTENT_MAX}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" disabled={pendingEdit} onClick={() => void submitEdit()}>
                          {pendingEdit ? "保存中…" : "変更を保存"}
                        </Button>
                        <Button type="button" variant="outline" disabled={pendingEdit} onClick={cancelEdit}>
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1 text-sm">
                        <p className="font-semibold text-foreground">
                          {formatActivityDateRangeJa(row.startDate, row.endDate)} — {row.title}
                        </p>
                        {row.location.trim().length > 0 ? (
                          <p className="text-muted-foreground">場所: {row.location}</p>
                        ) : null}
                        <p className="text-muted-foreground">
                          対戦: {formatOpponentsDisplayJa(row.opponent)}
                        </p>
                        {row.content.trim().length > 0 ? (
                          <p className="whitespace-pre-wrap text-muted-foreground">{row.content}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={deletingId !== null || pendingEdit}
                          onClick={() => beginEdit(row)}
                        >
                          <Pencil className="mr-1 h-4 w-4" aria-hidden />
                          修正
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId !== null || pendingEdit}
                          onClick={() => void remove(row.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                          {deletingId === row.id ? "削除中…" : "削除"}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
