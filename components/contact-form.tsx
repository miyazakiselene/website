"use client"

import { Instagram, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import Image from "next/image"

export function ContactForm() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80"
          alt="Basketball"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            お問い合わせ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl md:max-w-4xl mx-auto leading-relaxed md:whitespace-nowrap">
            <span className="block sm:inline">練習試合のお申し込み、</span>
            <span className="block sm:inline">その他ご質問などお気軽にお問い合わせください。</span>
          </p>
        </AnimatedSection>

        {/* Contact Actions */}
        <div className="max-w-2xl mx-auto space-y-6">
          <AnimatedSection animation="fadeInUp" delay={200}>
            <Card className="bg-background border-primary/30">
              <CardContent className="p-6 md:p-7">
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  本年度のクラブ生の募集は終了しました。
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" delay={260}>
            <Card className="bg-background border-border hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-8 md:p-10">
                <div className="space-y-6">
                  <AnimatedSection animation="fadeInUp" delay={320}>
                    <div className="rounded-xl border border-border bg-card/60 p-5 md:p-6">
                      <p className="text-base md:text-lg text-foreground leading-relaxed">
                        練習試合・合同練習・大会のお誘い等々、その他のご相談は、
                        <span className="block mt-1">Instagram のDMをご利用ください。</span>
                      </p>
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fadeInUp" delay={360}>
                    <Button
                      asChild
                      className="w-full group hover:scale-[1.02] transition-all duration-300 text-lg h-14"
                      size="lg"
                    >
                      <a
                        href="https://www.instagram.com/2026.selene/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-5 w-5 mr-2" />
                        @2026.selene にDMする
                      </a>
                    </Button>
                  </AnimatedSection>

                  <AnimatedSection animation="fadeInUp" delay={420}>
                    <div className="text-center text-base text-muted-foreground flex items-center justify-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      なるべく早急に対応いたしますが、返信が遅れる場合はご了承ください
                    </div>
                  </AnimatedSection>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
