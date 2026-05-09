"use client"

import { AnimatedSection } from "./animated-section"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const INSTAGRAM_URL = "https://www.instagram.com/2026.selene/"

export function InstagramFeed() {
  return (
    <section id="instagram" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
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
            チームの日常
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            練習風景や試合の様子をInstagramで発信中！
            <br />
            フォローして最新情報をチェックしてください。
          </p>
        </AnimatedSection>

        {/* LightWidget埋め込みエリア */}
        <AnimatedSection animation="fadeInUp" delay={200}>
          <div className="max-w-4xl mx-auto mb-14">
            {/* 
              =====================================================
              LightWidgetの埋め込みコードをここに貼り付けてください
              =====================================================
              
              手順:
              1. https://lightwidget.com/ にアクセス
              2. 「Create Your Free Widget」をクリック
              3. @2026.selene でInstagramにログイン・認証
              4. デザインを選択（推奨: グリッド形式、2行3列）
              5. 生成された<script>タグを含むコードをコピー
              6. 下の<div>内にペーストしてください
            */}
            <div 
              className="bg-card/50 rounded-3xl border border-border p-10 min-h-[400px] flex flex-col items-center justify-center"
            >
              {/* LightWidgetコードをここに貼り付け - START */}
              
              {/* 現在はプレースホルダーを表示 */}
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Instagram className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Instagram フィード</h3>
                  <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                    LightWidgetの埋め込みコードを取得後、
                    <br />
                    このエリアに最新の投稿が自動表示されます。
                  </p>
                </div>
                
                {/* プロフィールプレビュー */}
                <div className="mt-10 inline-flex items-center gap-4 bg-card rounded-full px-5 py-3 border border-border">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-card">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                        alt="宮崎 SELENE"
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground text-lg">@2026.selene</div>
                    <div className="text-base text-muted-foreground">宮崎 SELENE</div>
                  </div>
                </div>
              </div>
              
              {/* LightWidgetコードをここに貼り付け - END */}
            </div>
          </div>
        </AnimatedSection>

        {/* Follow Button */}
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
