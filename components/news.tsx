"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"

const upcomingPlans = [
  {
    id: "2026-05-24",
    date: "2026年5月24日",
    title: "大分遠征",
    venue: "詳細未定",
  },
  {
    id: "2026-05-30",
    date: "2026年5月30日",
    title: "大宮中学との練習試合",
    venue: "大宮中学校",
  },
  {
    id: "2026-05-31",
    date: "2026年5月31日",
    title: "赤江東中学・日向中学との練習試合",
    venue: "赤江東中学校",
  },
  {
    id: "2026-06-06-07",
    date: "2026年6月6日-7日",
    title: "アーリーサマーチャレンジ鹿児島2026",
    venue: "鹿児島県郡山体育館等",
  },
  {
    id: "2026-06-20-21",
    date: "2026年6月20日-21日",
    title: "令和8年度第3回宮崎県U15クラブバスケットボール夏季大会",
    venue: "詳細未定",
  },
]

export function News() {
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
          {upcomingPlans.map((plan, index) => (
            <AnimatedSection key={plan.id} animation="fadeInUp" delay={100 + index * 100}>
              <Card className="bg-background border-border hover:border-primary/40 transition-colors duration-300">
                <CardContent className="p-6 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                        <CalendarDays className="h-5 w-5" />
                        <span>{plan.date}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">{plan.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{plan.venue}</span>
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
