"use client"

import { Trophy, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useEffect, useState } from "react"

export type Match = {
  id: string
  opponent: string
  ourScore: number
  theirScore: number
  result: "win" | "loss"
}

export type Tournament = {
  id: string
  year: string
  name: string
  achievement: string
  matches: Match[]
}

const tournaments: Tournament[] = [
  {
    id: "1",
    year: "R8年度",
    name: "日の出ホルモンスプリングカップ",
    achievement: "第3位",
    matches: [
      { id: "m1", opponent: "本郷中", ourScore: 45, theirScore: 30, result: "win" },
      { id: "m2", opponent: "東海中", ourScore: 49, theirScore: 32, result: "win" },
      { id: "m3", opponent: "EPSIRON", ourScore: 42, theirScore: 58, result: "loss" },
      { id: "m4", opponent: "赤江東中", ourScore: 49, theirScore: 48, result: "win" },
    ],
  },
]

function ResultBadge({ result }: { result: Match["result"] }) {
  const variants = {
    win: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    loss: "bg-red-500/20 text-red-300 border-red-500/30",
  }

  const labels = {
    win: "WIN",
    loss: "LOSS",
  }

  return (
    <Badge variant="outline" className={`${variants[result]} text-sm font-bold px-3 py-1`}>
      {labels[result]}
    </Badge>
  )
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

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 1000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-black">
      {count}{suffix}
    </span>
  )
}

function MatchRow({ match, index }: { match: Match; index: number }) {
  return (
    <AnimatedSection animation="fadeInUp" delay={index * 100}>
      <div
        className="flex items-center justify-between p-5 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <ResultBadge result={match.result} />
          <span className="text-lg md:text-xl text-foreground font-semibold group-hover:text-primary transition-colors">
            vs {match.opponent}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl md:text-3xl font-black transition-transform group-hover:scale-110 ${match.result === "win" ? "text-emerald-400" : "text-red-400"}`}>
            {match.ourScore}
          </span>
          <span className="text-xl text-muted-foreground">-</span>
          <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
            {match.theirScore}
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
            Results
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            戦績・実績
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            これまでの大会成績と試合結果をご紹介します。
          </p>
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
                          <Trophy className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
                            <Calendar className="h-5 w-5" />
                            {tournament.year}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                            {tournament.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl md:text-5xl font-black text-primary animate-pulse">
                          {tournament.achievement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Results */}
                  <div className="p-6 md:p-8">
                    <div className="grid gap-4">
                      {tournament.matches.map((match, index) => (
                        <MatchRow key={match.id} match={match} index={index} />
                      ))}
                    </div>
                    
                    {/* Stats Summary */}
                    <div className="mt-8 pt-8 border-t border-border flex items-center justify-center gap-12">
                      <div className="text-center">
                        <AnimatedCounter 
                          value={tournament.matches.filter(m => m.result === "win").length} 
                        />
                        <span className="text-xl text-emerald-400 ml-2 font-bold">勝</span>
                      </div>
                      <div className="text-center">
                        <AnimatedCounter 
                          value={tournament.matches.filter(m => m.result === "loss").length} 
                        />
                        <span className="text-xl text-red-400 ml-2 font-bold">敗</span>
                      </div>
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
