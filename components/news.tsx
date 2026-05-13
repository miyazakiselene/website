"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronDown, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { partitionNewsByArchiveThreshold, type NewsRecord } from "@/lib/news-model"

function NewsCard({ item }: { item: NewsRecord }) {
  return (
    <Card className="border-border bg-background transition-colors duration-300 hover:border-primary/40">
      <CardContent className="p-4 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary md:mb-2 md:text-base">
              <CalendarDays className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
              <span>{item.date}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug text-foreground md:text-2xl">
              <Link
                href={`/news/${encodeURIComponent(item.id)}`}
                className="transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            </h3>
            {item.content != null && item.content.length > 0 ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.content}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground md:text-base">
            <MapPin className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
            <span>{item.venue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type NewsProps = {
  initialItems: NewsRecord[]
}

export function News({ initialItems }: NewsProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const { current: currentNews, past: pastNews } = useMemo(
    () => partitionNewsByArchiveThreshold(initialItems, now),
    [initialItems, now],
  )

  return (
    <section id="news" className="bg-card py-24 md:py-28">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-14 text-center" animation="fadeInUp">
          <span className="text-base font-semibold uppercase tracking-widest text-primary md:text-lg">
            News
          </span>
          <h2 className="mt-3 mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">お知らせ</h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
            今後の活動予定（試合予定）を掲載します。
          </p>
        </AnimatedSection>

        <div className="mx-auto grid max-w-4xl gap-4 md:gap-5">
          {currentNews.map((plan, index) => (
            <AnimatedSection key={plan.id} animation="fadeInUp" delay={100 + index * 100}>
              <NewsCard item={plan} />
            </AnimatedSection>
          ))}

          <AnimatedSection animation="fadeInUp" delay={100 + currentNews.length * 100}>
            <div className="space-y-4">
              <Collapsible className="rounded-2xl border border-border bg-background">
                <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 px-4 py-4 text-center md:gap-4 md:px-6 md:py-5">
                  <div>
                    <p className="text-base font-bold text-foreground md:text-lg">過去のお知らせを見る</p>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-4 md:px-5">
                    {pastNews.length > 0 ? (
                      <div className="grid gap-4">
                        {pastNews.map((item) => (
                          <NewsCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <p className="px-2 py-3 text-sm text-muted-foreground">
                        まだ過去のお知らせはありません。予定日の翌日以降に自動でここへ表示されます。
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <p className="px-2 text-sm text-muted-foreground">
                <Link
                  href="https://www.instagram.com/2026.selene/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  練習試合・合同練習・大会のお誘いはこちらにDMを下さい
                </Link>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
