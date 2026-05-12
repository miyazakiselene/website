"use client"

import Link from "next/link"
import { ExternalLink, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"

const relatedLinks = [
  {
    name: "一般社団法人 宮崎県バスケットボール協会 U15部会",
    url: "https://miyachugaku.hp-ez.com/",
    description: "県大会の組み合わせ・試合結果の確認はこちら。",
  },
  {
    name: "(一社)宮崎県バスケットボール協会",
    url: "http://miyazaki.japanbasketball.jp/",
    description: "宮崎県全体のバスケ情報・審判・3x3に関する公式サイト。",
  },
  {
    name: "TeamJBA (日本バスケットボール協会 会員登録管理システム)",
    url: "https://team-jba.jp/",
    description: "選手登録、指導者登録、大会エントリーのためのシステム。",
  },
  {
    name: "公益財団法人 日本バスケットボール協会 (JBA)",
    url: "http://www.japanbasketball.jp/",
    description: "公式競技規則（ルール）や全国の最新ニュース。",
  },
]

export function RelatedLinks() {
  return (
    <section id="related-links" className="py-24 md:py-28 bg-card">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14" animation="fadeInUp">
          <div className="inline-flex items-center gap-2 text-primary mb-5">
            <Link2 className="h-5 w-5" />
            <span className="text-base md:text-lg font-semibold uppercase tracking-widest">
              Related Links
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
            関連リンク集
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            大会情報や登録手続き、公式ルールの確認に便利な外部サイトをまとめています。
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto grid gap-5 md:grid-cols-2">
          {relatedLinks.map((item, index) => (
            <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
              <Card className="h-full bg-background border-border hover:border-primary/40 transition-colors duration-300">
                <CardContent className="p-6 md:p-7">
                  <div className="space-y-3">
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors"
                    >
                      <span>{item.name}</span>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
                    </Link>
                    <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
