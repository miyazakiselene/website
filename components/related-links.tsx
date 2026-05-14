"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, ExternalLink, Layers, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"

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
    <Card className="h-full border-border bg-background transition-colors duration-300 hover:border-primary/40">
      <CardContent className="p-6 md:p-7">
        <div className="space-y-3">
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-lg font-bold text-foreground transition-colors hover:text-primary md:text-xl"
          >
            <span>{item.name}</span>
            <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{item.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedLinkPeek({ item }: { item: RelatedLinkItem }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background p-4 shadow-md">
      <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{item.name}</p>
      <ExternalLink className="mt-2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
    </div>
  )
}

function MobileRelatedLinksDeck({
  items,
  expanded,
  onExpand,
  onCollapse,
}: {
  items: RelatedLinkItem[]
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
}) {
  const count = items.length
  if (count === 0) return null

  const stackHeight = Math.min(300, 118 + Math.max(0, count - 1) * 24)

  if (expanded) {
    return (
      <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-reduce:animate-none">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">一覧表示</p>
          <button
            type="button"
            onClick={onCollapse}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted motion-reduce:transition-none"
          >
            <Layers className="h-4 w-4" aria-hidden />
            カード表示に戻す
          </button>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {items.map((item, index) => (
            <div
              key={item.url}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-reduce:animate-none"
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <RelatedLinkCard item={item} />
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onCollapse}
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted motion-reduce:transition-none"
          >
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
            折りたたむ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onExpand()
          }
        }}
        aria-expanded={false}
        aria-label="関連リンクを縦の一覧で表示する"
        className="group relative w-full touch-manipulation rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        style={{ height: stackHeight }}
      >
        {items.map((item, index) => {
          const depth = index
          const z = 50 - depth
          const top = 8 + depth * 13
          const left = 6 + depth * 9
          const rotate = -5 + depth * 2.2
          return (
            <div
              key={item.url}
              className="pointer-events-none absolute w-[calc(100%-12px)] max-w-[calc(100%-12px)] origin-top-left shadow-lg transition-[transform,box-shadow] duration-300 motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:shadow-xl"
              style={{
                top,
                left,
                zIndex: z,
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <RelatedLinkPeek item={item} />
            </div>
          )
        })}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] flex justify-center rounded-b-2xl bg-gradient-to-t from-card via-card/90 to-transparent pb-3 pt-10"
          aria-hidden
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/95 px-4 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
            <ChevronUp className="h-4 w-4 motion-safe:animate-bounce motion-reduce:animate-none" />
            タップで一覧表示
          </span>
        </div>
      </div>
    </div>
  )
}

export function RelatedLinks() {
  const [mobileDeckExpanded, setMobileDeckExpanded] = useState(false)

  return (
    <section id="related-links" className="bg-card py-24 md:py-28">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-14 text-center" animation="fadeInUp">
          <div className="mb-5 inline-flex items-center gap-2 text-primary">
            <Link2 className="h-5 w-5" />
            <span className="text-base font-semibold uppercase tracking-widest md:text-lg">Related Links</span>
          </div>
          <h2 className="mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">関連リンク</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            大会情報や登録手続き、公式ルールの確認に便利な外部サイトをまとめています。
            <span className="mt-2 block md:hidden">
              スマホではリンクをカードのように重ねて表示します。タップで一覧に切り替わり、折りたたんで元に戻せます。
            </span>
          </p>
        </AnimatedSection>

        <div className="mx-auto max-w-5xl">
          <div className="hidden gap-5 md:grid md:grid-cols-2">
            {relatedLinks.map((item, index) => (
              <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
                <RelatedLinkCard item={item} />
              </AnimatedSection>
            ))}
          </div>
          <div className="md:hidden">
            <MobileRelatedLinksDeck
              items={relatedLinks}
              expanded={mobileDeckExpanded}
              onExpand={() => setMobileDeckExpanded(true)}
              onCollapse={() => setMobileDeckExpanded(false)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
