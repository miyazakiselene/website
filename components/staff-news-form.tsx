"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Megaphone, Pencil, Trash2 } from "lucide-react"
import { getStaffApiAccessCode } from "@/lib/staff-session"
import type { NewsRecord } from "@/lib/news-model"
import { NEWS_CONTENT_MAX, NEWS_TITLE_MAX, NEWS_VENUE_MAX } from "@/lib/news-validation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type StaffNewsFormProps = {
  initialItems: NewsRecord[]
}

function sortNewsStaffOrder(items: NewsRecord[]): NewsRecord[] {
  return [...items].sort((a, b) => b.eventEndDate.localeCompare(a.eventEndDate) || b.id.localeCompare(a.id))
}

const fetchJsonTimeoutMs = 30_000

export function StaffNewsForm({ initialItems }: StaffNewsFormProps) {
  const router = useRouter()
  const [items, setItems] = useState<NewsRecord[]>(() => sortNewsStaffOrder(initialItems))

  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [content, setContent] = useState("")
  const [venue, setVenue] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pendingAdd, setPendingAdd] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [pendingEdit, setPendingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setItems(sortNewsStaffOrder(initialItems))
  }, [initialItems])

  const beginEdit = (row: NewsRecord) => {
    setError("")
    setMessage("")
    setEditingId(row.id)
    setEditTitle(row.title)
    setEditStartDate(row.eventStartDate)
    setEditEndDate(row.eventStartDate === row.eventEndDate ? "" : row.eventEndDate)
    setEditVenue(row.venue === "詳細未定" ? "" : row.venue)
    setEditContent(row.content ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
    setEditStartDate("")
    setEditEndDate("")
    setEditContent("")
    setEditVenue("")
  }

  const submitAdd = async () => {
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
    setPendingAdd(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          title,
          startDate,
          endDate: endDate.trim() === "" ? undefined : endDate.trim(),
          content,
          venue: venue.trim(),
        }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: NewsRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: NewsRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "保存に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(sortNewsStaffOrder(data.items))
      setMessage("お知らせを保存しました。")
      setTitle("")
      setStartDate("")
      setEndDate("")
      setContent("")
      setVenue("")
      router.refresh()
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("通信がタイムアウトしました。ネットワークを確認して再度お試しください。")
      } else {
        setError("通信に失敗しました。")
      }
    } finally {
      window.clearTimeout(timeoutId)
      setPendingAdd(false)
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
    const effectiveEditEnd = editEndDate.trim() === "" ? editStartDate : editEndDate.trim()
    if (effectiveEditEnd < editStartDate) {
      setError("終了日は開始日以降にしてください。")
      return
    }
    setPendingEdit(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          id: editingId,
          title: editTitle,
          startDate: editStartDate,
          endDate: editEndDate.trim() === "" ? undefined : editEndDate.trim(),
          content: editContent,
          venue: editVenue.trim(),
        }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: NewsRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: NewsRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "更新に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(sortNewsStaffOrder(data.items))
      setMessage("お知らせを更新しました。")
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
    const confirmed = window.confirm("このお知らせを削除します。よろしいですか？")
    if (!confirmed) return
    setError("")
    setMessage("")
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。")
      return
    }
    setDeletingId(id)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), fetchJsonTimeoutMs)
    try {
      const response = await fetch("/api/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode, id }),
        signal: controller.signal,
      })
      let data: { error?: string; items?: NewsRecord[] }
      try {
        data = (await response.json()) as { error?: string; items?: NewsRecord[] }
      } catch {
        setError("サーバーからの応答を解釈できませんでした。")
        return
      }
      if (!response.ok) {
        setError(data.error ?? "削除に失敗しました。")
        return
      }
      if (Array.isArray(data.items)) setItems(sortNewsStaffOrder(data.items))
      setMessage("お知らせを削除しました。")
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
            <Megaphone className="h-6 w-6 text-primary" />
            お知らせを追加
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            入力内容は <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/news.json</code>{" "}
            に追記されます（ローカル開発向け）。終了日の翌日0時からトップの「過去のお知らせ」に移ります。1日のみの予定は終了日を空欄にしてください（活動記録と同じ操作です）。
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
            <Label htmlFor="staff-news-title">タイトル</Label>
            <Input
              id="staff-news-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 練習試合のお知らせ"
              autoComplete="off"
              maxLength={NEWS_TITLE_MAX}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-news-start">開始日</Label>
              <Input
                id="staff-news-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-news-end">終了日（1日のみのときは空欄）</Label>
              <Input id="staff-news-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-news-venue">会場（任意）</Label>
            <Input
              id="staff-news-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="未入力の場合は「詳細未定」"
              autoComplete="off"
              maxLength={NEWS_VENUE_MAX}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-news-content">内容</Label>
            <Textarea
              id="staff-news-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="お知らせの本文を入力"
              maxLength={NEWS_CONTENT_MAX}
            />
          </div>

          <Button type="button" className="w-full sm:w-auto" disabled={pendingAdd} onClick={() => void submitAdd()}>
            {pendingAdd ? "送信中…" : "お知らせを登録"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">お知らせの修正・削除</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ登録がありません。</p>
          ) : (
            <ul className="space-y-4">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/80 bg-secondary/15 p-4 md:p-5"
                >
                  {editingId === row.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-title-${row.id}`}>タイトル</Label>
                        <Input
                          id={`edit-title-${row.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={NEWS_TITLE_MAX}
                          autoComplete="off"
                        />
                      </div>
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
                          <Label htmlFor={`edit-end-${row.id}`}>終了日（1日のみのときは空欄）</Label>
                          <Input
                            id={`edit-end-${row.id}`}
                            type="date"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-venue-${row.id}`}>会場（任意）</Label>
                        <Input
                          id={`edit-venue-${row.id}`}
                          value={editVenue}
                          onChange={(e) => setEditVenue(e.target.value)}
                          maxLength={NEWS_VENUE_MAX}
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-content-${row.id}`}>内容</Label>
                        <Textarea
                          id={`edit-content-${row.id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={5}
                          maxLength={NEWS_CONTENT_MAX}
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
                        <p className="font-semibold text-foreground">{row.title}</p>
                        <p className="text-muted-foreground">
                          表示: {row.date}（開始 {row.eventStartDate} / 終了 {row.eventEndDate}）
                        </p>
                        <p className="text-muted-foreground">会場: {row.venue}</p>
                        {row.content != null && row.content.length > 0 ? (
                          <p className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">{row.content}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">（本文なし）</p>
                        )}
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
