"use client"

import { Heart, Target, Award, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { AnimatedSection } from "@/components/animated-section"

const goals = [
  {
    icon: Award,
    title: "宮崎県クラブ選手権優勝",
    description: "県内No.1を目指して",
  },
  {
    icon: Target,
    title: "全国大会出場",
    description: "全国の舞台へ挑戦",
  },
  {
    icon: Star,
    title: "U15ジュニアウィンターカップ",
    description: "県予選優勝を目指す",
  },
]

const staff = [
  {
    name: "徳重 里奈",
    role: "ヘッドコーチ (HC)",
    description: "選手一人ひとりの成長を大切に、基礎から丁寧に指導します。",
  },
  {
    name: "久留 伸一",
    role: "アシスタントコーチ / 代表 (AC)",
    description: "チーム運営と選手のサポートを担当。保護者との連携を重視しています。",
  },
]

const photoGallery = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
    alt: "練習風景1",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&q=80",
    alt: "練習風景2",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&q=80",
    alt: "練習風景3",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=400&q=80",
    alt: "練習風景4",
  },
]

export function TeamAbout() {
  return (
    <section id="about" className="py-24 md:py-32 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-20" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            About Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            チーム紹介
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            宮崎県のバスケットボールファンに応援されるチームを目指し、
            <br />
            選手の心身の健全な育成に取り組んでいます。
          </p>
        </AnimatedSection>

        {/* Photo Gallery - Scrolling */}
        <AnimatedSection className="mb-20" animation="fadeIn" delay={200}>
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll">
              {[...photoGallery, ...photoGallery].map((photo, index) => (
                <div
                  key={`${photo.id}-${index}`}
                  className="relative flex-shrink-0 w-80 h-56 rounded-2xl overflow-hidden group"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 text-base font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.alt}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ※ 写真はダミーです。後で差し替えます。
          </p>
        </AnimatedSection>

        {/* Mission */}
        <AnimatedSection className="mb-20" animation="fadeInUp" delay={100}>
          <Card className="bg-background border-border overflow-hidden hover:border-primary/50 transition-colors duration-300">
            <CardContent className="p-8 md:p-14">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                    私たちの目的
                  </h3>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    宮崎 SELENEは、バスケットボールを通じて宮崎県の女子中学生の<span className="text-foreground font-semibold">心身の健全な育成</span>を目指すクラブチームです。
                    <br />
                    技術の向上だけでなく、チームワーク、礼儀、努力する姿勢など、人として大切なことを学ぶ場でありたいと考えています。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Goals */}
        <div className="mb-20">
          <AnimatedSection animation="fadeInUp" delay={200}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
              目標
            </h3>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={300 + index * 100}>
                <Card
                  className="bg-background border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group h-full"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <goal.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                      {goal.title}
                    </h4>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {goal.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Staff */}
        <div>
          <AnimatedSection animation="fadeInUp" delay={400}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
              スタッフ紹介
            </h3>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {staff.map((member, index) => (
              <AnimatedSection key={index} animation={index === 0 ? "fadeInLeft" : "fadeInRight"} delay={500 + index * 100}>
                <Card className="bg-background border-border hover:border-primary/50 transition-all duration-300 group h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      {/* Placeholder Avatar */}
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                        <span className="text-3xl font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                          {member.name[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-foreground">
                          {member.name}
                        </h4>
                        <p className="text-base md:text-lg text-primary font-semibold mb-3">
                          {member.role}
                        </p>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                          {member.description}
                        </p>
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
