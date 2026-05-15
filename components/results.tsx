"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar, ChevronDown, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AnimatedSection } from "@/components/animated-section"
import {
  inferCalendarYearFromYearLabel,
  publicTournamentCalendarYear,
  sortMatchesNewestFirst,
  sortSlashDateStringsDesc,
  sortTournamentsNewestFirst,
} from "@/lib/activity-records-sort"
import type { Match, Tournament } from "@/lib/activity-results-types"

export type { Match, Tournament } from "@/lib/activity-results-types"

const MAX_VISIBLE_RESULTS = 6

const fallbackTournaments: Tournament[] = [
  {
    id: "2026-spring-cup",
    period: "2026年4月4日-5日",
    name: "日の出ホルモンスプリングカップ",
    venue: "生目中学校",
    matches: [
      {
        id: "2026-04-04-1",
        date: "4/4",
        opponent: "本郷中学校",
      },
      {
        id: "2026-04-04-2",
        date: "4/4",
        opponent: "東海中学校",
      },
      { id: "2026-04-05-1", date: "4/5", opponent: "EPSIRON" },
      {
        id: "2026-04-05-2",
        date: "4/5",
        opponent: "赤江東中学校",
      },
    ],
  },
  {
    id: "2026-04-18",
    period: "2026年4月18日",
    name: "練習試合",
    venue: "木花中学校",
    matches: [{ id: "2026-04-18-1", date: "4/18", opponent: "木花中学校" }],
  },
  {
    id: "2026-04-25",
    period: "2026年4月25日",
    name: "練習試合",
    venue: "日向学院高校",
    matches: [
      { id: "2026-04-25-1", date: "4/25", opponent: "日向学院高校" },
      { id: "2026-04-25-2", date: "4/25", opponent: "タートル（社会人）" },
    ],
  },
  {
    id: "2026-04-29",
    period: "2026年4月29日",
    name: "練習試合",
    venue: "国光春中学校",
    matches: [
      { id: "2026-04-29-1", date: "4/29", opponent: "宮附中学校" },
      { id: "2026-04-29-2", date: "4/29", opponent: "国光春中学校" },
      { id: "2026-04-29-3", date: "4/29", opponent: "南郷中学校" },
      { id: "2026-04-29-4", date: "4/29", opponent: "都農中学校" },
      { id: "2026-04-29-5", date: "4/29", opponent: "日向中学校" },
      { id: "2026-04-29-6", date: "4/29", opponent: "富田・高鍋東中学校" },
      { id: "2026-04-29-7", date: "4/29", opponent: "野尻・飯野中学校" },
    ],
  },
  {
    id: "2026-05-02",
    period: "2026年5月2日",
    name: "練習試合",
    venue: "宮商高校",
    matches: [{ id: "2026-05-02-1", date: "5/2", opponent: "宮商高校" }],
  },
  {
    id: "2026-05-04",
    period: "2026年5月4日",
    name: "練習試合",
    venue: "祝吉中学校",
    matches: [
      { id: "2026-05-04-1", date: "5/4", opponent: "EPSIRON" },
      { id: "2026-05-04-2", date: "5/4", opponent: "REDSUNS" },
      { id: "2026-05-04-3", date: "5/4", opponent: "祝吉中学校" },
      { id: "2026-05-04-4", date: "5/4", opponent: "ELPIS" },
      { id: "2026-05-04-5", date: "5/4", opponent: "苅田中学校" },
    ],
  },
  {
    id: "2026-05-06",
    period: "2026年5月6日",
    name: "練習試合",
    venue: "宮崎市総合体育館",
    matches: [{ id: "2026-05-06-1", date: "5/6", opponent: "CRISIS" }],
  },
  {
    id: "2026-05-09",
    period: "2026年5月9日",
    name: "練習試合",
    venue: "生目台中学校",
    matches: [
      { id: "2026-05-09-1", date: "5/9", opponent: "清武中学校" },
      { id: "2026-05-09-2", date: "5/9", opponent: "生目台中学校" },
    ],
  },
]

function groupMatchesByDate(
  matches: Match[],
  tournament: { id: string; period: string; year?: string },
): { date: string; matches: Match[] }[] {
  const year =
    (tournament.year ? inferCalendarYearFromYearLabel(tournament.year) : null) ??
    publicTournamentCalendarYear(tournament)
  const order: string[] = []
  const grouped = new Map<string, Match[]>()

  for (const match of matches) {
    if (!grouped.has(match.date)) {
      order.push(match.date)
      grouped.set(match.date, [])
    }
    grouped.get(match.date)?.push(match)
  }

  return sortSlashDateStringsDesc(order, year).map((date) => ({
    date,
    matches: grouped.get(date) ?? [],
  }))
}

function ResultsAccordionCard({ tournament }: { tournament: Tournament }) {
  const t = useTranslations("results")
  const groupedMatches = groupMatchesByDate(tournament.matches, tournament)

  return (
    <Card className="h-full overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/30">
      <CardContent className="p-0">
        <Collapsible className="group" defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center gap-3 border-b border-border bg-secondary/50 p-4 text-left outline-none transition-colors hover:bg-secondary/65 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 md:gap-4 md:p-6">
            <div className="flex min-w-0 flex-1 items-start gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 md:h-12 md:w-12">
                <Calendar className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground md:mb-2 md:text-sm">
                  <Calendar className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                  <span>{tournament.period}</span>
                </div>
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground md:text-xl">
                  {tournament.name}
                </h3>
                {tournament.venue ? (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground md:mt-2 md:text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                    <span className="line-clamp-1">{tournament.venue}</span>
                  </div>
                ) : null}
                <p className="mt-1.5 text-xs text-muted-foreground md:mt-2 md:text-sm">
                  {t("matchCount", { count: tournament.matches.length })}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 md:h-5 md:w-5" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="p-4 md:p-6">
              {groupedMatches.length > 0 ? (
                <div className="space-y-5 md:space-y-6">
                  {groupedMatches.map(({ date, matches }) => (
                    <div key={`${tournament.id}-${date}`}>
                      <div className="mb-2.5 flex flex-wrap items-center gap-2.5 md:mb-3 md:gap-3">
                        <Badge
                          variant="outline"
                          className="border-primary/30 px-3 py-1 text-xs text-primary md:text-sm"
                        >
                          {date}
                        </Badge>
                        <span className="text-xs text-muted-foreground md:text-sm">
                          {t("matches", { count: matches.length })}
                        </span>
                      </div>
                      <ul className="grid gap-2 md:gap-3">
                        {matches.map((match) => (
                          <li
                            key={match.id}
                            className="rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5 text-sm font-semibold text-foreground md:px-4 md:py-3 md:text-base"
                          >
                            <p>{match.opponent}</p>
                            {match.content != null && match.content.trim().length > 0 ? (
                              <p className="mt-2 whitespace-pre-wrap text-xs font-normal leading-relaxed text-muted-foreground md:text-sm">
                                {match.content}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                  {t("preparingOpponents")}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

type ResultsProps = {
  initialTournaments?: Tournament[]
}

function MobileResultsList({
  visibleTournaments,
  archivedTournaments,
}: {
  visibleTournaments: Tournament[]
  archivedTournaments: Tournament[]
}) {
  const t = useTranslations("results")
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mx-auto max-w-4xl md:hidden">
      <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-center">
        <p className="text-base font-bold text-foreground">{t("openList")}</p>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-4">
            {visibleTournaments.map((tournament, index) => (
              <AnimatedSection key={tournament.id} animation="fadeInUp" delay={100 + index * 100}>
                <ResultsAccordionCard tournament={tournament} />
              </AnimatedSection>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
            {t("closeList")}
          </button>

          {archivedTournaments.length > 0 ? (
            <Collapsible className="rounded-2xl border border-border bg-card">
              <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 px-4 py-4 text-center">
                <p className="text-base font-bold text-foreground">{t("pastResults")}</p>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border px-4 py-4">
                  <div className="grid gap-4">
                    {archivedTournaments.map((tournament) => (
                      <ResultsAccordionCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Results({ initialTournaments }: ResultsProps) {
  const t = useTranslations("results")
  const sortedNewestFirst: Tournament[] = useMemo(() => {
    const source =
      initialTournaments != null && initialTournaments.length > 0 ? initialTournaments : fallbackTournaments

    return sortTournamentsNewestFirst(source).map((tournament) => ({
      ...tournament,
      matches: sortMatchesNewestFirst(
        tournament.matches,
        tournament.year !== undefined
          ? { id: tournament.id, year: tournament.year }
          : { id: tournament.id, period: tournament.period },
      ),
    }))
  }, [initialTournaments])

  const visibleTournaments = sortedNewestFirst.slice(0, MAX_VISIBLE_RESULTS)
  const archivedTournaments = sortedNewestFirst.slice(MAX_VISIBLE_RESULTS)

  return (
    <section id="results" className="py-24 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-14 text-center" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            {t("sectionLabel")}
          </span>
          <h2 className="mt-3 mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>
        </AnimatedSection>

        {/* デスクトップ: 1列リスト */}
        <div className="mx-auto hidden max-w-4xl grid-cols-1 gap-4 md:grid md:gap-5">
          {visibleTournaments.map((tournament, index) => (
            <AnimatedSection key={tournament.id} animation="fadeInUp" delay={100 + index * 100}>
              <ResultsAccordionCard tournament={tournament} />
            </AnimatedSection>
          ))}

          <AnimatedSection animation="fadeInUp" delay={100 + visibleTournaments.length * 100}>
            <div className="space-y-4">
              <Collapsible className="rounded-2xl border border-border bg-card">
                <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 px-4 py-4 text-center md:gap-4 md:px-6 md:py-5">
                  <p className="text-base font-bold text-foreground md:text-lg">{t("pastResults")}</p>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-4 md:px-5">
                    {archivedTournaments.length > 0 ? (
                      <div className="grid gap-4">
                        {archivedTournaments.map((tournament) => (
                          <ResultsAccordionCard key={tournament.id} tournament={tournament} />
                        ))}
                      </div>
                    ) : (
                      <p className="px-2 py-3 text-sm text-muted-foreground">
                        {t("noPastResults")}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </AnimatedSection>
        </div>

        {/* モバイル: お知らせと同じ Collapsible */}
        <MobileResultsList
          visibleTournaments={visibleTournaments}
          archivedTournaments={archivedTournaments}
        />
      </div>
    </section>
  )
}
