"use client"

import { useCallback, useEffect, useRef } from "react"
import Script from "next/script"
import { AnimatedSection } from "./animated-section"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const INSTAGRAM_URL = "https://www.instagram.com/2026.selene/"
const MAX_VISIBLE_INSTAGRAM_POSTS = 9

type InstagramFeedProps = {
  embedPostUrls?: string[]
}

function processInstagramEmbeds() {
  if (typeof window === "undefined") return
  const instgrm = (
    window as unknown as { instgrm?: { Embeds?: { process: () => void } } }
  ).instgrm
  instgrm?.Embeds?.process()
}

export function InstagramFeed({ embedPostUrls = [] }: InstagramFeedProps) {
  const visibleEmbedPostUrls = embedPostUrls.slice(0, MAX_VISIBLE_INSTAGRAM_POSTS)
  const hasEmbeds = visibleEmbedPostUrls.length > 0
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
  }, [clearEmbedTimers, hasEmbeds, scheduleEmbedProcessing, visibleEmbedPostUrls])

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
          <Script
            src="https://www.instagram.com/embed.js"
            strategy="afterInteractive"
            onLoad={() => scheduleEmbedProcessing()}
          />
        ) : null}

        <AnimatedSection animation="fadeInUp" delay={200}>
          <div className="max-w-6xl mx-auto mb-14 rounded-3xl border border-border/70 bg-card/70 p-6 md:p-8 backdrop-blur-sm shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)]">
            <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border/60 bg-background/70 px-6 py-6 text-center md:flex-row md:text-left">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5 shadow-lg">
                  <div className="relative h-full w-full rounded-2xl overflow-hidden bg-card">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                      alt="宮崎 SELENE"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-500">
                    <Sparkles className="h-4 w-4" />
                    LATEST 9 POSTS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">@2026.selene</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    最新の9件だけをグリッド表示しています。
                  </p>
                </div>
              </div>

              <Link href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 gap-3 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Instagram className="w-5 h-5" />
                  Instagramを見る
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {hasEmbeds ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleEmbedPostUrls.map((url) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background px-2 pt-2 shadow-sm"
                  >
                    <blockquote
                      className="instagram-media !m-0 !min-w-0 !max-w-none"
                      data-instgrm-permalink={url}
                      data-instgrm-version="14"
                      style={{
                        background: "#fff",
                        border: 0,
                        borderRadius: "16px",
                        margin: 0,
                        maxWidth: "100%",
                        minWidth: "0",
                        width: "100%",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/70 px-6 py-10 text-center md:min-h-[560px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Instagram className="h-4 w-4" />
                  Instagram 埋め込み準備OK
                </div>
                <h3 className="text-2xl font-bold text-foreground">投稿URLを入れるとここに表示されます</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  公式埋め込みでは、Instagram のプロフィール全体ではなく
                  投稿またはリールのURLが必要です。
                  <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                    NEXT_PUBLIC_INSTAGRAM_EMBED_URLS
                  </code>
                  にカンマ区切りで入れると反映されます。
                </p>
                <div className="mt-6 rounded-2xl border border-border/60 bg-card px-4 py-3 text-left font-mono text-xs text-muted-foreground">
                  https://www.instagram.com/p/xxxx/ , https://www.instagram.com/reel/yyyy/
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
