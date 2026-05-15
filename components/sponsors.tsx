"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Instagram } from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimatedSection } from "@/components/animated-section"

const sponsors = [
  {
    id: "1",
    name: "花笑み すずらんこども園",
    url: "https://hanaemi-suzuran.com/overview/",
    logo: "/sponsor-suzuran.png",
    width: 300,
    height: 80,
  },
  {
    id: "2",
    name: "株式会社クラタカ",
    url: "https://kurataka.com/",
    logo: "/sponsor-kurataka.png",
    width: 200,
    height: 60,
  },
  {
    id: "3",
    name: "医療法人社団 誠友会 南部病院",
    url: "https://nanbuhp.or.jp/",
    logo: "/sponsor-nanbu-hospital.png",
    width: 150,
    height: 120,
  },
]

export function Sponsors() {
  const t = useTranslations("sponsors")

  return (
    <section className="py-20 md:py-24 bg-card border-t border-border overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-14" animation="fadeInUp">
          <div className="inline-flex items-center gap-3 text-primary mb-5">
            <Heart className="h-6 w-6 animate-pulse" />
            <span className="text-base md:text-lg font-semibold uppercase tracking-widest">
              {t("sectionLabel")}
            </span>
            <Heart className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t("description")}
          </p>
        </AnimatedSection>

        {/* Sponsor Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {sponsors.map((sponsor, index) => (
            <AnimatedSection key={sponsor.id} animation="scaleIn" delay={100 + index * 150}>
              <Link
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group h-full flex flex-col items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                <div className="relative w-full h-20 sm:h-24 md:h-28 rounded-lg bg-white">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
                    className="object-contain opacity-95 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="w-full rounded-md bg-slate-100/90 border border-slate-200 px-3 py-2">
                  <p className="text-sm md:text-base text-center font-bold text-slate-800 leading-snug tracking-wide">
                    {sponsor.name}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* Thank you message */}
        <AnimatedSection animation="fadeIn" delay={500}>
          <p className="text-center text-base md:text-lg text-muted-foreground mt-12">
            {t("thankYou")}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={600} className="mt-10 max-w-2xl mx-auto">
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-6 md:px-8 md:py-7 text-center space-y-4">
            <p className="text-base md:text-lg text-foreground leading-relaxed whitespace-pre-line">
              {t("newSponsor")}
            </p>
            <Link
              href="https://www.instagram.com/2026.selene/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Instagram className="h-5 w-5 shrink-0" />
              {t("instagramButton")}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
