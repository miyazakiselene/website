"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Megaphone } from "lucide-react"
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
  initialCount: number
}

export function StaffNewsForm({ initialCount }: StaffNewsFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [content, setContent] = useState("")
  const [venue, setVenue] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const submit = async () => {
    setError("")
    setMessage("")
    const accessCode = getStaffApiAccessCode()
    if (accessCode == null || accessCode.length === 0) {
      setError("セッションにアクセスコードがありません。一度ログアウトして、関係者ページから再度認証してください。")
      return
    }
    setPending(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000)
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          title,
          date,
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
      setMessage("お知らせを保存しました。トップページを再読み込みすると反映されます。")
      setTitle("")
      setDate("")
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
      setPending(false)
    }
  }

  return (
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
          に追記されます（ローカル開発向け）。日付は試合・イベントの最終日として扱われ、翌日0時から「過去のお知らせ」に移ります。
        </p>
        <p className="text-xs text-muted-foreground">現在の登録件数: {initialCount} 件</p>

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
        <div className="space-y-2">
          <Label htmlFor="staff-news-date">日付（イベント最終日）</Label>
          <Input id="staff-news-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

        <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={submit}>
          {pending ? "送信中…" : "お知らせを登録"}
        </Button>
      </CardContent>
    </Card>
  )
}
