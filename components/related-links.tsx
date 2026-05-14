"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ExternalLink, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type RelatedLinkItem = {
  name: string
  url: string
  description: string
}

const relatedLinks: RelatedLinkItem[] = [
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

function RelatedLinkCard({ item }: { item: RelatedLinkItem }) {
  return (
    <Card className="border-border bg-background transition-colors duration-300 hover:border-primary/40">
      <CardContent className="p-5 md:p-7">
        <div className="space-y-2">
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-base font-bold text-foreground transition-colors hover:text-primary md:text-lg"
          >
            <span>{item.name}</span>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {item.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function MobileRelatedLinksList({ items }: { items: RelatedLinkItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mx-auto max-w-4xl md:hidden">
      <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-center">
        <p className="text-base font-bold text-foreground">関連リンク一覧を開く</p>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-4">
            {items.map((item, index) => (
              <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
                <RelatedLinkCard item={item} />
              </AnimatedSection>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
            関連リンク一覧を閉じる
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function RelatedLinks() {
  return (
    <section id="related-links" className="bg-card py-24 md:py-28">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-14 text-center" animation="fadeInUp">
          <div className="mb-5 inline-flex items-center gap-2 text-primary">
            <Link2 className="h-5 w-5" />
            <span className="text-base font-semibold uppercase tracking-widest md:text-lg">
              Related Links
            </span>
          </div>
          <h2 className="mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            関連リンク
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            大会情報や登録手続き、公式ルールの確認に便利な外部サイトをまとめています。
          </p>
        </AnimatedSection>

        {/* デスクトップ: 1列リスト */}
        <div className="mx-auto hidden max-w-4xl grid-cols-1 gap-4 md:grid md:gap-5">
          {relatedLinks.map((item, index) => (
            <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
              <RelatedLinkCard item={item} />
            </AnimatedSection>
          ))}
        </div>

        {/* モバイル: 折りたたみ */}
        <MobileRelatedLinksList items={relatedLinks} />
      </div>
    </section>
  )
}
