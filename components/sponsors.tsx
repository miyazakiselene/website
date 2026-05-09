"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

const sponsors = [
  {
    id: "1",
    name: "花笑み すずらんこども園",
    url: "https://hanaemi-suzuran.com/overview/",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-90leTCUKotq6xL1tSnUUt2F7aKTxxW.png",
    width: 300,
    height: 80,
  },
  {
    id: "2",
    name: "株式会社クラタカ",
    url: "https://kurataka.com/",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XvXbsKCgmAEOguhwzv90kBAbrVjMr5.png",
    width: 200,
    height: 60,
  },
  {
    id: "3",
    name: "医療法人社団 誠友会 南部病院",
    url: "https://nanbuhp.or.jp/",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MM6RLkuFm5aXD7ZgkAjHs7m0foFOCy.png",
    width: 150,
    height: 120,
  },
]

export function Sponsors() {
  return (
    <section className="py-20 md:py-24 bg-card border-t border-border overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-14" animation="fadeInUp">
          <div className="inline-flex items-center gap-3 text-primary mb-5">
            <Heart className="h-6 w-6 animate-pulse" />
            <span className="text-base md:text-lg font-semibold uppercase tracking-widest">
              Sponsors
            </span>
            <Heart className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            スポンサー
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            私たちの活動を支援してくださっているスポンサー企業様
          </p>
        </AnimatedSection>

        {/* Sponsor Logos */}
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {sponsors.map((sponsor, index) => (
            <AnimatedSection key={sponsor.id} animation="scaleIn" delay={100 + index * 150}>
              <Link
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-110 hover:-translate-y-1"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={sponsor.width}
                  height={sponsor.height}
                  className="object-contain max-h-24 md:max-h-28 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* Thank you message */}
        <AnimatedSection animation="fadeIn" delay={500}>
          <p className="text-center text-base md:text-lg text-muted-foreground mt-12">
            ご支援いただきありがとうございます
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
