"use client"

import { useState } from "react"
import { MessageCircle, Send } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const NICKNAME_MAX = 30
const CONTENT_MAX  = 100

type Status = "idle" | "submitting" | "success" | "error"

export function CheerMessageForm() {
  const [nickname, setNickname] = useState("")
  const [content,  setContent]  = useState("")
  const [status,   setStatus]   = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? "送信に失敗しました。")
        setStatus("error")
        return
      }
      setStatus("success")
      setNickname("")
      setContent("")
    } catch {
      setErrorMsg("ネットワークエラーが発生しました。")
      setStatus("error")
    }
  }

  return (
    <section id="cheer" className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-10 text-center" animation="fadeInUp">
          <div className="mb-4 inline-flex items-center gap-2 text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="text-base font-semibold uppercase tracking-widest md:text-lg">
              Cheer
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-black text-foreground md:text-4xl">
            応援メッセージ
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            選手たちへの応援メッセージをお寄せください。
          </p>
        </AnimatedSection>

        <AnimatedSection className="mx-auto max-w-lg" animation="fadeInUp" delay={100}>
          <Card className="border-border bg-card">
            <CardContent className="p-6 md:p-8">
              {status === "success" ? (
                <div className="space-y-3 py-8 text-center">
                  <div className="text-5xl">🎉</div>
                  <p className="text-lg font-bold text-foreground">ありがとうございます！</p>
                  <p className="text-sm text-muted-foreground">メッセージを受け付けました。</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setStatus("idle")}
                  >
                    もう一件送る
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nickname */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cheer-nickname" className="text-sm font-semibold">
                      ニックネーム
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        （{NICKNAME_MAX}文字以内）
                      </span>
                    </Label>
                    <Input
                      id="cheer-nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={NICKNAME_MAX}
                      placeholder="例: バスケファン"
                      disabled={status === "submitting"}
                      required
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cheer-content" className="text-sm font-semibold">
                        メッセージ
                      </Label>
                      <span
                        className={`text-xs tabular-nums ${
                          content.length >= CONTENT_MAX * 0.9
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {content.length} / {CONTENT_MAX}
                      </span>
                    </div>
                    <Textarea
                      id="cheer-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={CONTENT_MAX}
                      placeholder="いつも応援しています！"
                      rows={4}
                      disabled={status === "submitting"}
                      required
                      className="resize-none"
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && errorMsg && (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      status === "submitting" ||
                      nickname.trim().length === 0 ||
                      content.trim().length === 0
                    }
                  >
                    {status === "submitting" ? (
                      "送信中..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        送信する
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  )
}
