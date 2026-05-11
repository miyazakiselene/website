"use client"

import { useEffect, useMemo, useState } from "react"
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

export type Match = {
  id: string
  date: string
  opponent: string
  videoUrls?: string[]
}

export type Tournament = {
  id: string
  period: string
  year?: string
  name: string
  venue?: string
  matches: Match[]
}

type StaffRecord = {
  id: string
  year: string
  name: string
  venue?: string
  matches: {
    id: string
    date: string
    opponent: string
    videoUrls?: string[]
  }[]
}

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
        videoUrls: [
          "https://youtu.be/ekqVSPBONEo",
          "https://youtu.be/cF30aUAkoTs",
          "https://youtu.be/Ro7SVwMZ-LE",
          "https://youtu.be/sv5xeasue4w",
        ],
      },
      {
        id: "2026-04-04-2",
        date: "4/4",
        opponent: "東海中学校",
        videoUrls: [
          "https://youtu.be/sv5xeasue4w",
          "https://youtu.be/GFo-gB4DSmE",
          "https://youtu.be/oEs-a4PVCVs",
          "https://youtu.be/Y4TmTjS_QJs",
        ],
      },
      { id: "2026-04-05-1", date: "4/5", opponent: "EPSIRON" },
      {
        id: "2026-04-05-2",
        date: "4/5",
        opponent: "赤江東中学校",
        videoUrls: [
          "https://www.youtube.com/watch?v=eIHmpeqeADQ",
          "https://youtu.be/rp2YkmzBxZ0",
          "https://youtu.be/I-LeuR86ajQ",
          "https://youtu.be/sqNlNkGcwgM",
        ],
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

function normalizeVideoUrls(urls?: string[]): string[] {
  if (!Array.isArray(urls)) return []
  return urls.map((url) => (typeof url === "string" ? url.trim() : "")).filter((url) => url !== "")
}

function mapStaffRecords(records: StaffRecord[]): Tournament[] {
  return records.map((record) => ({
    id: record.id,
    period: record.year,
    year: record.year,
    name: record.name,
    venue: record.venue ?? "",
    matches: Array.isArray(record.matches)
      ? record.matches.map((match) => ({
          id: match.id,
          date: match.date,
          opponent: match.opponent,
          videoUrls: normalizeVideoUrls(match.videoUrls),
        }))
      : [],
  }))
}

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
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    if (!map.has(m.date)) {
      order.push(m.date)
      map.set(m.date, [])
    }
    map.get(m.date)!.push(m)
  }
  const datesDesc = sortSlashDateStringsDesc(order, year)
  return datesDesc.map((date) => ({ date, matches: map.get(date)! }))
}

export function Results() {
  const [tournaments, setTournaments] = useState<Tournament[]>(fallbackTournaments)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/staff-records", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { records?: StaffRecord[] }
        if (cancelled) return
        if (Array.isArray(data.records) && data.records.length > 0) {
          setTournaments(mapStaffRecords(data.records))
        }
      } catch {
        // APIが使えない場合はfallbackTournamentsを表示
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayTournaments: Tournament[] = useMemo(
    () =>
      sortTournamentsNewestFirst(tournaments).map((t) => ({
        ...t,
        matches: sortMatchesNewestFirst(
          t.matches,
          t.year ? { id: t.id, year: t.year } : { id: t.id, period: t.period },
        ),
      })),
    [tournaments],
  )

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

        {/* Tournament Results */}
        <div className="max-w-4xl mx-auto space-y-8">
          {displayTournaments.map((tournament) => (
            <AnimatedSection key={tournament.id} animation="scaleIn" delay={100}>
              <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-0">
                  <Collapsible className="group" defaultOpen={false}>
                    <CollapsibleTrigger className="flex w-full items-center gap-4 border-b border-border bg-secondary/50 p-6 text-left outline-none transition-colors hover:bg-secondary/65 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 md:gap-5 md:p-8">
                      <div className="flex min-w-0 flex-1 items-start gap-4 md:gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 animate-pulse md:h-16 md:w-16">
                          <Calendar className="h-7 w-7 text-primary md:h-8 md:w-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2 text-base text-muted-foreground">
                            <Calendar className="h-5 w-5 shrink-0" />
                            {tournament.period}
                          </div>
                          <h3 className="text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                            {tournament.name}
                          </h3>
                          {tournament.venue ? (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              {tournament.venue}
                            </div>
                          ) : null}
                          <p className="sr-only">タップまたは Enter で試合の対戦相手一覧を開きます</p>
                        </div>
                      </div>
                      <ChevronDown className="h-6 w-6 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-6 md:p-8">
                        <div className="space-y-8">
                          {groupMatchesByDate(tournament.matches, {
                            id: tournament.id,
                            period: tournament.period,
                          }).map(({ date, matches }) => (
                            <div key={`${tournament.id}-${date}`}>
                              <div className="mb-3 flex flex-wrap items-center gap-3">
                                <Badge
                                  variant="outline"
                                  className="text-xs md:text-sm px-3 py-1 border-primary/30 text-primary"
                                >
                                  {date}
                                </Badge>
                                <span className="text-sm text-muted-foreground">対戦 {matches.length}件</span>
                              </div>
                              <ul className="grid gap-2 md:gap-3">
                                {matches.map((match) => (
                                  <li
                                    key={match.id}
                                    className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-base font-semibold text-foreground md:text-lg"
                                  >
                                    <p>{match.opponent}</p>
                                    {match.videoUrls && match.videoUrls.length > 0 ? (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {match.videoUrls.map((url, idx) => (
                                          <a
                                            key={`${match.id}-video-${idx}`}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-md border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:border-primary/60 hover:bg-primary/10"
                                          >
                                            動画 {idx + 1}
                                          </a>
                                        ))}
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
