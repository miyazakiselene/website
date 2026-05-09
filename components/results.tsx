"use client"

import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"

export type Match = {
  id: string
  date: string
  opponent: string
}

export type Tournament = {
  id: string
  period: string
  name: string
  venue?: string
  matches: Match[]
}

const tournaments: Tournament[] = [
  {
    id: "2026-spring-cup",
    period: "2026年4月4日-5日",
    name: "日の出ホルモンスプリングカップ",
    venue: "生目中学",
    matches: [
      { id: "2026-04-04-1", date: "4/4", opponent: "本郷中学" },
      { id: "2026-04-04-2", date: "4/4", opponent: "東海中学" },
      { id: "2026-04-05-1", date: "4/5", opponent: "EPSIRON" },
      { id: "2026-04-05-2", date: "4/5", opponent: "赤江東中学" },
    ],
  },
  {
    id: "2026-04-18",
    period: "2026年4月18日",
    name: "練習試合",
    venue: "木花中学",
    matches: [{ id: "2026-04-18-1", date: "4/18", opponent: "木花中学" }],
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
    venue: "国光春中学",
    matches: [
      { id: "2026-04-29-1", date: "4/29", opponent: "宮附中学" },
      { id: "2026-04-29-2", date: "4/29", opponent: "国光春中学" },
      { id: "2026-04-29-3", date: "4/29", opponent: "南郷中学" },
      { id: "2026-04-29-4", date: "4/29", opponent: "都農中学" },
      { id: "2026-04-29-5", date: "4/29", opponent: "日向中学" },
      { id: "2026-04-29-6", date: "4/29", opponent: "富田・高鍋東中学" },
      { id: "2026-04-29-7", date: "4/29", opponent: "野尻・飯野中学" },
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
    venue: "祝吉中学",
    matches: [
      { id: "2026-05-04-1", date: "5/4", opponent: "EPSIRON" },
      { id: "2026-05-04-2", date: "5/4", opponent: "REDSUNS" },
      { id: "2026-05-04-3", date: "5/4", opponent: "祝吉中学" },
      { id: "2026-05-04-4", date: "5/4", opponent: "ELPIS" },
      { id: "2026-05-04-5", date: "5/4", opponent: "苅田中学" },
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
    venue: "生目台中学",
    matches: [
      { id: "2026-05-09-1", date: "5/9", opponent: "清武中学" },
      { id: "2026-05-09-2", date: "5/9", opponent: "生目台中学" },
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

function MatchRow({ match, index }: { match: Match; index: number }) {
  return (
    <AnimatedSection animation="fadeInUp" delay={index * 100}>
      <div
        className="flex items-center justify-between p-5 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs md:text-sm px-3 py-1 border-primary/30 text-primary">
            {match.date}
          </Badge>
          <span className="text-base md:text-xl text-foreground font-semibold group-hover:text-primary transition-colors">
            対戦チーム：{match.opponent}
          </span>
        </div>
      </div>
    </AnimatedSection>
  )
}

export function Results() {
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
            大会参加・活動記録
          </h2>
        </AnimatedSection>

        {/* Tournament Results */}
        <div className="max-w-4xl mx-auto space-y-8">
          {tournaments.map((tournament) => (
            <AnimatedSection key={tournament.id} animation="scaleIn" delay={100}>
              <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-0">
                  {/* Tournament Header */}
                  <div className="bg-secondary/50 p-8 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Calendar className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
                            <Calendar className="h-5 w-5" />
                            {tournament.period}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                            {tournament.name}
                          </h3>
                          {tournament.venue ? (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {tournament.venue}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Records */}
                  <div className="p-6 md:p-8">
                    <div className="grid gap-4">
                      {tournament.matches.map((match, index) => (
                        <MatchRow key={match.id} match={match} index={index} />
                      ))}
                    </div>

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
