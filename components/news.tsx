"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"
import { CalendarDays, ChevronDown, MapPin } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { partitionNewsByArchiveThreshold, type NewsRecord } from "@/lib/news-model"

function formatNewsDateEn(startIso: string, endIso: string): string {
  const s = parseISO(startIso)
  const e = parseISO(endIso)
  if (startIso === endIso) return format(s, "MMM d, yyyy", { locale: enUS })
  const sy = format(s, "yyyy")
  const ey = format(e, "yyyy")
  if (sy === ey) {
    if (format(s, "MM") === format(e, "MM")) {
      return `${format(s, "MMM d", { locale: enUS })}–${format(e, "d, yyyy", { locale: enUS })}`
    }
    return `${format(s, "MMM d", { locale: enUS })} – ${format(e, "MMM d, yyyy", { locale: enUS })}`
  }
  return `${format(s, "MMM d, yyyy", { locale: enUS })} – ${format(e, "MMM d, yyyy", { locale: enUS })}`
}

function NewsCard({ item }: { item: NewsRecord }) {
  const locale = useLocale()
  const dateLabel =
    locale === "en"
      ? formatNewsDateEn(item.eventStartDate, item.eventEndDate)
      : item.date

  return (
    <Card className="border-border bg-background transition-colors duration-300 hover:border-primary/40">
      <CardContent className="p-4 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary md:mb-2 md:text-base">
              <CalendarDays className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
              <span>{dateLabel}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug text-foreground md:text-2xl">{item.title}</h3>
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

function MobileNewsList({
  currentNews,
  pastNews,
}: {
  currentNews: NewsRecord[]
  pastNews: NewsRecord[]
}) {
  const t = useTranslations("news")
  const [open, setOpen] = useState(false)

  const pinnedItem = currentNews[0] ?? pastNews[0] ?? null
  const remainingCurrent = currentNews.slice(1)

  return (
    <div className="mx-auto max-w-4xl space-y-4 md:hidden">
      {pinnedItem && (
        <AnimatedSection animation="fadeInUp" delay={100}>
          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-0.5 shadow-md shadow-primary/20 ring-2 ring-primary/30">
            <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-bold tracking-wide text-primary-foreground shadow">
              {t("latestNews")}
            </div>
            <div className="rounded-xl overflow-hidden">
              <NewsCard item={pinnedItem} />
            </div>
          </div>
        </AnimatedSection>
      )}

      <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-center">
        <p className="text-base font-bold text-foreground">{t("openList")}</p>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-4">
            {remainingCurrent.map((plan, index) => (
              <AnimatedSection key={plan.id} animation="fadeInUp" delay={100 + index * 100}>
                <NewsCard item={plan} />
              </AnimatedSection>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
            {t("closeList")}
          </button>

          <AnimatedSection animation="fadeInUp" delay={100 + currentNews.length * 100}>
            <div className="space-y-4">
              <Collapsible className="rounded-2xl border border-border bg-background">
                <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 px-4 py-4 text-center">
                  <div>
                    <p className="text-base font-bold text-foreground">{t("pastNews")}</p>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-4">
                    {pastNews.length > 0 ? (
                      <div className="grid gap-4">
                        {pastNews.map((item) => (
                          <NewsCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <p className="px-2 py-3 text-sm text-muted-foreground">{t("noPastNews")}</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <p className="px-2 pt-2 text-center">
                <Link
                  href="https://www.instagram.com/2026.selene/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-base font-semibold text-primary underline-offset-4 hover:underline md:text-lg"
                >
                  {t("instagramLink")}
                </Link>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

type NewsProps = {
  initialItems: NewsRecord[]
}

export function News({ initialItems }: NewsProps) {
  const t = useTranslations("news")
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
            {t("sectionLabel")}
          </span>
          <h2 className="mt-3 mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">{t("title")}</h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">{t("description")}</p>
        </AnimatedSection>

        <div className="mx-auto hidden max-w-4xl grid-cols-1 gap-4 md:grid md:gap-5">
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
                    <p className="text-base font-bold text-foreground md:text-lg">{t("pastNews")}</p>
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
                      <p className="px-2 py-3 text-sm text-muted-foreground">{t("noPastNews")}</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <p className="px-2 pt-2 text-center">
                <Link
                  href="https://www.instagram.com/2026.selene/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-base font-semibold text-primary underline-offset-4 hover:underline md:text-lg"
                >
                  {t("instagramLink")}
                </Link>
              </p>
            </div>
          </AnimatedSection>
        </div>

        <MobileNewsList currentNews={currentNews} pastNews={pastNews} />
      </div>
    </section>
  )
}
