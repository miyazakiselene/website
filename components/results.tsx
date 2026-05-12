"use client"

import { useMemo } from "react"
import { Calendar, ChevronDown, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AnimatedSection } from "@/components/animated-section"
import { sortMatchesNewestFirst, sortTournamentsNewestFirst } from "@/lib/activity-records-sort"

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
const MAX_VISIBLE_MATCHES_PER_CARD = 6

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

function ResultsCard({ tournament }: { tournament: Tournament }) {
  const visibleMatches = tournament.matches.slice(0, MAX_VISIBLE_MATCHES_PER_CARD)
  const hiddenMatchesCount = Math.max(0, tournament.matches.length - visibleMatches.length)

  return (
    <Card className="h-full border-border bg-card transition-all duration-300 hover:border-primary/30">
      <CardContent className="flex h-full min-h-[340px] flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{tournament.period}</span>
            </div>
            <h3 className="line-clamp-2 text-lg font-bold text-foreground md:text-xl">{tournament.name}</h3>
            {tournament.venue ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{tournament.venue}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <p className="mb-3 text-sm font-semibold text-foreground">対戦相手</p>
          {visibleMatches.length > 0 ? (
            <ul className="grid gap-2">
              {visibleMatches.map((match) => (
                <li
                  key={match.id}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2"
                >
                  <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">
                    {match.date}
                  </Badge>
                  <p className="min-w-0 text-sm font-medium text-foreground md:text-base">
                    {match.opponent}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
              対戦情報を準備中です。
            </div>
          )}

          {hiddenMatchesCount > 0 ? (
            <p className="mt-auto pt-4 text-sm text-muted-foreground">
              ほか {hiddenMatchesCount} 試合は活動記録内に含まれています。
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

type ResultsProps = {
  initialTournaments?: Tournament[]
}

export function Results({ initialTournaments }: ResultsProps) {
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleTournaments.map((tournament, index) => (
              <AnimatedSection key={tournament.id} animation="scaleIn" delay={100 + index * 50}>
                <ResultsCard tournament={tournament} />
              </AnimatedSection>
            ))}
          </div>

          {archivedTournaments.length > 0 ? (
            <AnimatedSection animation="fadeInUp" delay={180}>
              <Collapsible className="rounded-2xl border border-border bg-card">
                <CollapsibleTrigger className="group flex w-full items-center justify-center gap-4 px-6 py-5 text-center">
                  <p className="text-lg font-bold text-foreground">過去の活動記録を見る</p>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-5 md:px-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {archivedTournaments.map((tournament, index) => (
                        <AnimatedSection key={tournament.id} animation="fadeInUp" delay={80 + index * 40}>
                          <ResultsCard tournament={tournament} />
                        </AnimatedSection>
                      ))}
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
