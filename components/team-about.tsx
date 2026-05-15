"use client"

import { Target, Award, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { AnimatedSection } from "@/components/animated-section"
import type { TeamGalleryPhoto } from "@/lib/team-gallery-defaults"

const goalIcons = [Award, Target, Star]

type TeamAboutProps = {
  galleryPhotos: TeamGalleryPhoto[]
}

export function TeamAbout({ galleryPhotos }: TeamAboutProps) {
  const t = useTranslations("about")
  const goals   = t.raw("goals.items") as Array<{ title: string; description: string }>
  const members = t.raw("staff.members") as Array<{ name: string; role: string; description: string }>

  return (
    <section id="about" className="py-24 md:py-32 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-20" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            {t("sectionLabel")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {t("description")}
          </p>
        </AnimatedSection>

        {/* Photo Gallery */}
        <AnimatedSection className="mb-20" animation="fadeIn" delay={200}>
          {galleryPhotos.length > 0 ? (
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
              <div
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                role="list"
                aria-label={t("galleryAria")}
              >
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative w-[min(100vw-3rem,20rem)] shrink-0 snap-center aspect-[320/224] overflow-hidden rounded-2xl border border-border/60 bg-background group md:w-full"
                  >
                    <div className="absolute inset-3">
                      <Image src={photo.src} alt={photo.alt} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 max-w-[90%] text-sm font-semibold text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:text-base">
                      {photo.alt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`team-gallery-placeholder-${index}`} className="flex aspect-[320/224] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <div>
                    <p className="font-semibold text-foreground">{t("galleryPlaceholderTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("galleryPlaceholderBody")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* Mission */}
        <AnimatedSection className="mb-20" animation="fadeInUp" delay={100}>
          <Card className="bg-background border-border overflow-hidden hover:border-primary/50 transition-colors duration-300">
            <CardContent className="p-8 md:p-14">
              <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-10">
                <div className="hidden shrink-0 self-stretch rounded-full bg-gradient-to-b from-primary via-primary/50 to-primary/15 md:block md:w-1.5 md:min-h-[7rem]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary md:text-sm md:tracking-[0.25em]">
                      {t("mission.label")}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="h-1 w-14 shrink-0 rounded-full bg-gradient-to-r from-primary to-primary/40 md:w-20" aria-hidden />
                      <span className="text-sm font-semibold text-foreground md:text-base">{t("mission.heading")}</span>
                      <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{t("mission.title")}</h3>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                    {t("mission.body1")}
                    <span className="text-foreground font-semibold">{t("mission.bold")}</span>
                    {t("mission.body2")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Goals */}
        <div className="mb-20">
          <AnimatedSection animation="fadeInUp" delay={200}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">{t("goals.title")}</h3>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const Icon = goalIcons[index] ?? Award
              return (
                <AnimatedSection key={index} animation="fadeInUp" delay={300 + index * 100}>
                  <Card className="bg-background border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">{goal.title}</h4>
                      <p className="text-base md:text-lg text-muted-foreground">{goal.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              )
            })}
          </div>
        </div>

        {/* Staff */}
        <div>
          <AnimatedSection animation="fadeInUp" delay={400}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">{t("staff.title")}</h3>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {members.map((member, index) => (
              <AnimatedSection key={index} animation={index === 0 ? "fadeInLeft" : "fadeInRight"} delay={500 + index * 100}>
                <Card className="bg-background border-border hover:border-primary/50 transition-all duration-300 group h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                        <span className="text-3xl font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                          {member.name[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-foreground">{member.name}</h4>
                        <p className="text-sm md:text-base text-primary font-semibold mt-1">{member.role}</p>
                        <p className="text-muted-foreground mt-3 leading-relaxed">{member.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
