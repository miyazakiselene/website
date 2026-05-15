"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, Clock, RefreshCw, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getStaffApiAccessCode } from "@/lib/staff-session"
import type { MessageRecord } from "@/lib/messages-supabase"

export function StaffMessagesManager() {
  const [messages,    setMessages]    = useState<MessageRecord[]>([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState("")
  const [actionError, setActionError] = useState("")

  const fetchMessages = useCallback(async () => {
    const code = getStaffApiAccessCode()
    if (!code) {
      setFetchError("アクセスコードが見つかりません。再ログインしてください。")
      setLoading(false)
      return
    }
    setLoading(true)
    setFetchError("")
    try {
      const res  = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${code}` },
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok) { setFetchError(json.error ?? "取得に失敗しました。"); return }
      setMessages(json.messages ?? [])
    } catch {
      setFetchError("ネットワークエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const handleDelete = async (id: string) => {
    if (!window.confirm("このメッセージを削除しますか？この操作は取り消せません。")) return
    const code = getStaffApiAccessCode()
    if (!code) return
    setActionError("")
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${code}` },
      })
      if (!res.ok) {
        const json = await res.json()
        setActionError(json.error ?? "削除に失敗しました。")
        return
      }
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setActionError("ネットワークエラーが発生しました。")
    }
  }

  const handleApprove = async (id: string) => {
    const code = getStaffApiAccessCode()
    if (!code) return
    setActionError("")
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${code}` },
      })
      if (!res.ok) {
        const json = await res.json()
        setActionError(json.error ?? "承認に失敗しました。")
        return
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_approved: true } : m)),
      )
    } catch {
      setActionError("ネットワークエラーが発生しました。")
    }
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">読み込み中...</p>
    )
  }

  if (fetchError) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={fetchMessages}>再試行</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length === 0
            ? "メッセージはまだありません。"
            : `${messages.length} 件 （承認済み: ${messages.filter((m) => m.is_approved).length} 件）`}
        </p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchMessages}>
          <RefreshCw className="h-3.5 w-3.5" />
          更新
        </Button>
      </div>

      {/* アクションエラー */}
      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {/* メッセージ一覧 */}
      {messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id} className="border-border bg-background">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  {/* 本文 */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{msg.nickname}</span>
                      {msg.is_approved ? (
                        <Badge
                          variant="default"
                          className="gap-1 bg-emerald-600 text-xs hover:bg-emerald-600"
                        >
                          <CheckCircle className="h-3 w-3" />
                          承認済み
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          未承認
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString("ja-JP", {
                          year:   "numeric",
                          month:  "2-digit",
                          day:    "2-digit",
                          hour:   "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {msg.content}
                    </p>
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex shrink-0 flex-col gap-2">
                    {!msg.is_approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-emerald-600/40 text-emerald-600 hover:border-emerald-600 hover:bg-emerald-600/10"
                        onClick={() => handleApprove(msg.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        承認
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
