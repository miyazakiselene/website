"use client"

import Script from "next/script"
import { AnimatedSection } from "./animated-section"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const INSTAGRAM_URL = "https://www.instagram.com/2026.selene/"
const LIGHTWIDGET_WIDGET_URL =
  "https://lightwidget.com/widgets/2609db9226d45b76b14b4c5005c3b270.html"

export function InstagramFeed() {

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

        <Script src="https://cdn.lightwidget.com/widgets/lightwidget.js" strategy="afterInteractive" />

        <AnimatedSection animation="fadeInUp" delay={200}>
          <div className="max-w-6xl mx-auto mb-14">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
              <div className="rounded-3xl border border-border/70 bg-card/70 p-8 md:p-10 backdrop-blur-sm shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)]">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5 shadow-lg">
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

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-500">
                      <Sparkles className="h-4 w-4" />
                      SNS GALLERY
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">@2026.selene</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      練習風景、試合の空気感、日々のチームの表情を
                      Instagram でまとめてチェックできます。
                    </p>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-4">
                      <p className="text-lg font-black text-foreground">Game</p>
                      <p className="text-xs text-muted-foreground">試合動画</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-4">
                      <p className="text-lg font-black text-foreground">Team</p>
                      <p className="text-xs text-muted-foreground">活動記録</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-4">
                      <p className="text-lg font-black text-foreground">Daily</p>
                      <p className="text-xs text-muted-foreground">日常の様子</p>
                    </div>
                  </div>

                  <Link href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 gap-3 py-7 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Instagram className="w-6 h-6" />
                      Instagramを見る
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/70 p-3 md:p-4 backdrop-blur-sm shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)]">
                <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background">
                  <iframe
                    src={LIGHTWIDGET_WIDGET_URL}
                    title="宮崎 SELENE Instagram gallery"
                    scrolling="no"
                    allowTransparency={true}
                    className="lightwidget-widget min-h-[420px] w-full border-0 overflow-hidden md:min-h-[560px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
