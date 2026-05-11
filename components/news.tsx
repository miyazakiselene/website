"use client"

import Link from "next/link"
import { CalendarDays, ChevronDown, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type NewsItem = {
  id: string
  date: string
  title: string
  venue: string
  status: "current" | "past"
}

const newsItems: NewsItem[] = [
  {
    id: "2026-05-24",
    date: "2026年5月24日",
    title: "大分遠征",
    venue: "詳細未定",
    status: "current",
  },
  {
    id: "2026-05-30",
    date: "2026年5月30日",
    title: "大宮中学校との練習試合",
    venue: "大宮中学校",
    status: "current",
  },
  {
    id: "2026-05-31",
    date: "2026年5月31日",
    title: "赤江東中学校・日向中学校との練習試合",
    venue: "赤江東中学校",
    status: "current",
  },
  {
    id: "2026-06-06-07",
    date: "2026年6月6日-7日",
    title: "アーリーサマーチャレンジ鹿児島2026",
    venue: "鹿児島県郡山体育館等",
    status: "current",
  },
  {
    id: "2026-06-20-21",
    date: "2026年6月20日-21日",
    title: "令和8年度第3回宮崎県U15クラブバスケットボール夏季大会",
    venue: "詳細未定",
    status: "current",
  },
]

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Card className="bg-background border-border hover:border-primary/40 transition-colors duration-300">
      <CardContent className="p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <CalendarDays className="h-5 w-5" />
              <span>{item.date}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{item.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{item.venue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function News() {
  const currentNews = newsItems.filter((item) => item.status === "current")
  const pastNews = newsItems.filter((item) => item.status === "past")

  return (
    <section id="news" className="py-24 md:py-28 bg-card">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            News
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            お知らせ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            今後の活動予定（試合予定）を掲載します。
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto grid gap-5">
          {currentNews.map((plan, index) => (
            <AnimatedSection key={plan.id} animation="fadeInUp" delay={100 + index * 100}>
              <NewsCard item={plan} />
            </AnimatedSection>
          ))}

          <AnimatedSection animation="fadeInUp" delay={100 + currentNews.length * 100}>
            <Collapsible className="rounded-2xl border border-border bg-background">
              <CollapsibleTrigger className="group flex w-full items-center justify-center gap-4 px-6 py-5 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">過去のお知らせを見る</p>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border px-4 py-4 md:px-5">
                  <p className="px-2 pb-4 text-sm text-muted-foreground">
                    <Link
                      href="https://www.instagram.com/2026.selene/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      練習試合・合同練習・大会のお誘いはこちらにDMを下さい
                    </Link>
                  </p>
                  {pastNews.length > 0 ? (
                    <div className="grid gap-4">
                      {pastNews.map((item) => (
                        <NewsCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      まだ過去のお知らせはありません。終了したらこの中へ移します。
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
