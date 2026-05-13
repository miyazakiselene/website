"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, Trash2 } from "lucide-react"
import type { ActivityRecord } from "@/lib/activities-model"
import {
  ACTIVITIES_CONTENT_MAX,
  ACTIVITIES_LOCATION_MAX,
  ACTIVITIES_OPPONENT_MAX,
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

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${y}年${Number(m)}月${Number(d)}日`
}

export function StaffActivitiesManager({ initialItems }: StaffActivitiesManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<ActivityRecord[]>(initialItems)
  const [date, setDate] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [content, setContent] = useState("")
  const [opponent, setOpponent] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const submit = async () => {
    setError("")
    setMessage("")
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。一度ログアウトして、関係者ページから再度認証してください。")
      return
    }
    if (date.trim() === "") {
      setError("日付を入力してください。")
      return
    }

    setPending(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000)
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          title,
          date,
          location: location.trim(),
          content,
          opponent,
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
      setTitle("")
      setLocation("")
      setContent("")
      setOpponent("")
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
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000)
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
            に保存され、トップの活動記録セクションに反映されます。
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

          <div className="space-y-2">
            <Label htmlFor="activity-date">日付</Label>
            <Input id="activity-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
            <Label htmlFor="activity-opponent">対戦相手</Label>
            <Input
              id="activity-opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="例: ○○中学校"
              autoComplete="off"
              maxLength={ACTIVITIES_OPPONENT_MAX}
            />
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

          <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={submit}>
            {pending ? "送信中…" : "活動記録を登録"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">登録済みの活動記録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ登録がありません。</p>
          ) : (
            <ul className="space-y-3">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 bg-secondary/20 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{formatDisplayDate(row.date)} — {row.title}</p>
                    {row.location.trim().length > 0 ? (
                      <p className="text-muted-foreground">場所: {row.location}</p>
                    ) : null}
                    <p className="text-muted-foreground">対戦: {row.opponent}</p>
                    {row.content.trim().length > 0 ? (
                      <p className="whitespace-pre-wrap text-muted-foreground">{row.content}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={deletingId !== null}
                    onClick={() => void remove(row.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                    {deletingId === row.id ? "削除中…" : "削除"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
