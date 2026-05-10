"use client"

import { useCallback, useEffect, useRef } from "react"
import Script from "next/script"
import { AnimatedSection } from "./animated-section"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const INSTAGRAM_URL = "https://www.instagram.com/2026.selene/"

type InstagramFeedProps = {
  /** サーバー（app/page）で環境変数から解決した投稿・リールの permalink 一覧 */
  embedPostUrls: string[]
}

function processInstagramEmbeds() {
  if (typeof window === "undefined") return
  const instgrm = (
    window as unknown as { instgrm?: { Embeds?: { process: () => void } } }
  ).instgrm
  instgrm?.Embeds?.process()
}

export function InstagramFeed({ embedPostUrls }: InstagramFeedProps) {
  const hasEmbeds = embedPostUrls.length > 0
  const embedTimersRef = useRef<number[]>([])

  const clearEmbedTimers = useCallback(() => {
    embedTimersRef.current.forEach((t) => window.clearTimeout(t))
    embedTimersRef.current = []
  }, [])

  const scheduleEmbedProcessing = useCallback(() => {
    clearEmbedTimers()
    const delays = [0, 80, 200, 500, 1200, 2500, 5000]
    embedTimersRef.current = delays.map((ms) =>
      window.setTimeout(() => processInstagramEmbeds(), ms),
    )
  }, [clearEmbedTimers])

  useEffect(() => {
    if (!hasEmbeds) return
    scheduleEmbedProcessing()
    return () => clearEmbedTimers()
  }, [hasEmbeds, embedPostUrls, scheduleEmbedProcessing, clearEmbedTimers])

  return (
    <section id="instagram" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full border-4 border-primary" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full border-4 border-primary" />
      </div>

      <div className="container mx-auto px-4">
        <AnimatedSection animation="fadeInUp" className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-5 py-2.5 rounded-full text-base font-semibold mb-6">
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
            コートからの最新レポート
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            練習風景や試合の様子をInstagramで発信中！
            <br />
            フォローして最新情報をチェックしてください。
          </p>
        </AnimatedSection>

        {hasEmbeds ? (
          <>
            <Script
              src="https://www.instagram.com/embed.js"
              strategy="afterInteractive"
              onLoad={() => scheduleEmbedProcessing()}
            />
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="max-w-5xl mx-auto mb-14 space-y-6">
                <p className="text-center text-sm text-muted-foreground">
                  下の投稿は公式の埋め込み表示です（サイト側でLightwidgetは使いません）。
                </p>
                <div className="flex flex-col items-center gap-8">
                  {embedPostUrls.map((url) => (
                    <blockquote
                      key={url}
                      className="instagram-media"
                      data-instgrm-permalink={url}
                      data-instgrm-version="14"
                      style={{
                        background: "#fff",
                        border: 0,
                        borderRadius: "12px",
                        margin: "0 auto",
                        maxWidth: "540px",
                        minWidth: "280px",
                        width: "100%",
                      }}
                    />
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </>
        ) : (
          <AnimatedSection animation="fadeInUp" delay={200}>
            <div className="max-w-4xl mx-auto mb-14">
              <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
                  <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
                    <div className="relative h-full w-full rounded-2xl overflow-hidden bg-card">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                        alt="宮崎 SELENE"
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">@2026.selene</h3>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Link
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-background/80 p-6 text-center transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <Instagram className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-foreground">Instagramを見る</span>
                    <span className="text-xs text-muted-foreground">投稿・リール・アプリ表示をまとめて確認</span>
                  </Link>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
                  投稿をこのページ内に直接表示したい場合は、公開中の投稿URLを
                  <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[11px]">
                    NEXT_PUBLIC_INSTAGRAM_EMBED_URLS
                  </code>
                  にカンマ区切りで設定してください（公式埋め込み）。
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animation="fadeInUp" delay={400} className="text-center">
          <Link href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 gap-3 px-10 py-7 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Instagram className="w-6 h-6" />
              @2026.selene をフォロー
              <ExternalLink className="w-5 h-5" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
