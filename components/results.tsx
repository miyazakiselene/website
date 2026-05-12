"use client"

import { useMemo, useState } from "react"
import { Calendar, ChevronDown, ChevronUp, Layers, MapPin } from "lucide-react"
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

export type Match = {
  id: string
  date: string
  opponent: string
}

export type Tournament = {
  id: string
  period: string
  year?: string
  name: string
  venue?: string
  matches: Match[]
}

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

function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M50 2 Q50 50 50 98" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 50 Q50 50 98 50" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20 Q50 35 92 20" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 80 Q50 65 92 80" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

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
                  {tournament.matches.length}試合を表示
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
                          {matches.length}試合
                        </span>
                      </div>
                      <ul className="grid gap-2 md:gap-3">
                        {matches.map((match) => (
                          <li
                            key={match.id}
                            className="rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5 text-sm font-semibold text-foreground md:px-4 md:py-3 md:text-base"
                          >
                            <p>{match.opponent}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                  対戦情報を準備中です。
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

function MobileActivityDeck({
  tournaments,
  expanded,
  onExpand,
  onCollapse,
}: {
  tournaments: Tournament[]
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
}) {
  const count = tournaments.length
  if (count === 0) return null

  const stackHeight = Math.min(320, 140 + Math.max(0, count - 1) * 28)

  if (expanded) {
    return (
      <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-reduce:animate-none">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
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
        <div className="grid grid-cols-1 gap-6">
          {tournaments.map((tournament, index) => (
            <div
              key={tournament.id}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-reduce:animate-none"
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <ResultsAccordionCard tournament={tournament} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
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
        aria-label="活動記録を縦の一覧で表示する"
        className="group relative w-full touch-manipulation rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        style={{ height: stackHeight }}
      >
        {tournaments.map((tournament, index) => {
          const depth = index
          const z = 50 - depth
          const top = 8 + depth * 14
          const left = 6 + depth * 10
          const rotate = -5 + depth * 2.2
          return (
            <div
              key={tournament.id}
              className="pointer-events-none absolute w-[calc(100%-12px)] max-w-[calc(100%-12px)] origin-top-left shadow-lg transition-[transform,box-shadow] duration-300 motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:shadow-xl"
              style={{
                top,
                left,
                zIndex: z,
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <ResultsAccordionCard tournament={tournament} />
            </div>
          )
        })}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] flex justify-center rounded-b-2xl bg-gradient-to-t from-background via-background/90 to-transparent pb-3 pt-10"
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

export function Results({ initialTournaments }: ResultsProps) {
  const [mobileMainDeckExpanded, setMobileMainDeckExpanded] = useState(false)
  const [mobileArchivedDeckExpanded, setMobileArchivedDeckExpanded] = useState(false)

  const displayTournaments: Tournament[] = useMemo(() => {
    const source =
      initialTournaments != null && initialTournaments.length > 0 ? initialTournaments : fallbackTournaments

    return sortTournamentsNewestFirst(source).map((tournament) => ({
      ...tournament,
      matches: sortMatchesNewestFirst(
        tournament.matches,
        tournament.year
          ? { id: tournament.id, year: tournament.year }
          : { id: tournament.id, period: tournament.period },
      ),
    }))
  }, [initialTournaments])
  const visibleTournaments = displayTournaments.slice(0, MAX_VISIBLE_RESULTS)
  const archivedTournaments = displayTournaments.slice(MAX_VISIBLE_RESULTS)

  return (
    <section id="results" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Decorative elements with animation */}
      <div className="absolute top-10 right-[5%] animate-spin-slow">
        <BasketballIcon className="w-24 h-24 text-primary/10" />
      </div>
      <div className="absolute bottom-20 left-[3%] animate-bounce" style={{ animationDuration: "4s" }}>
        <BasketballIcon className="w-16 h-16 text-primary/8" />
      </div>
      <div className="absolute top-1/2 right-[2%] animate-pulse">
        <BasketballIcon className="w-12 h-12 text-primary/5" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            Activity
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            活動記録
          </h2>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mb-10 max-w-4xl text-center" animation="fadeInUp" delay={180}>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            対戦していただいたチームの皆様、ありがとうございました。今後ともよろしくお願いいたします。
          </p>
        </AnimatedSection>

        <div className="mx-auto max-w-6xl space-y-8">
          {/* デスクトップ: 従来の3列グリッド */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-6">
            {visibleTournaments.map((tournament, index) => (
              <AnimatedSection key={tournament.id} animation="scaleIn" delay={100 + index * 50}>
                <ResultsAccordionCard tournament={tournament} />
              </AnimatedSection>
            ))}
          </div>

          {/* スマホ: トランプ風の重ね → タップで縦一覧 */}
          <div className="md:hidden">
            <MobileActivityDeck
              tournaments={visibleTournaments}
              expanded={mobileMainDeckExpanded}
              onExpand={() => setMobileMainDeckExpanded(true)}
              onCollapse={() => setMobileMainDeckExpanded(false)}
            />
          </div>

          {archivedTournaments.length > 0 ? (
            <AnimatedSection animation="fadeInUp" delay={180}>
              <Collapsible className="rounded-2xl border border-border bg-card">
                <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 px-4 py-4 text-center md:gap-4 md:px-6 md:py-5">
                  <p className="text-base font-bold text-foreground md:text-lg">過去の活動記録を見る</p>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-5 md:px-6">
                    <div className="hidden md:grid md:grid-cols-3 md:gap-6">
                      {archivedTournaments.map((tournament, index) => (
                        <AnimatedSection key={tournament.id} animation="fadeInUp" delay={80 + index * 40}>
                          <ResultsAccordionCard tournament={tournament} />
                        </AnimatedSection>
                      ))}
                    </div>
                    <div className="md:hidden">
                      <MobileActivityDeck
                        tournaments={archivedTournaments}
                        expanded={mobileArchivedDeckExpanded}
                        onExpand={() => setMobileArchivedDeckExpanded(true)}
                        onCollapse={() => setMobileArchivedDeckExpanded(false)}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </AnimatedSection>
          ) : null}
        </div>
      </div>
    </section>
  )
}
