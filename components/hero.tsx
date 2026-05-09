"use client"

import { Trophy, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

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

function BasketballRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="50" cy="20" rx="30" ry="10" />
      <line x1="20" y1="20" x2="25" y2="70" />
      <line x1="80" y1="20" x2="75" y2="70" />
      <line x1="35" y1="28" x2="37" y2="65" />
      <line x1="65" y1="28" x2="63" y2="65" />
      <line x1="50" y1="30" x2="50" y2="70" />
      <path d="M25 45 Q50 55 75 45" />
      <path d="M27 60 Q50 70 73 60" />
    </svg>
  )
}

function FloatingBall({ delay, className }: { delay: number; className: string }) {
  return (
    <div 
      className={`absolute animate-bounce ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: "3s" }}
    >
      <BasketballIcon className="w-full h-full text-primary/20" />
    </div>
  )
}

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsLoaded(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80"
          alt="Basketball court background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(218,165,32,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,85,104,0.2),transparent_50%)]" />
      </div>

      {/* Animated Basketball Court Lines */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-2 border-primary rounded-full transition-all duration-1000 ${isLoaded ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          style={{ transitionDelay: "0.3s" }}
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border-2 border-primary rounded-full transition-all duration-1000 ${isLoaded ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          style={{ transitionDelay: "0.5s" }}
        />
        <div 
          className={`absolute top-1/2 left-0 right-0 h-[2px] bg-primary transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.7s" }}
        />
      </div>

      {/* Floating Basketball Elements */}
      <FloatingBall delay={0} className="top-20 right-[10%] w-16 h-16" />
      <FloatingBall delay={0.5} className="bottom-32 left-[8%] w-12 h-12" />
      <FloatingBall delay={1} className="top-[40%] right-[5%] w-8 h-8" />
      <FloatingBall delay={1.5} className="top-[60%] left-[5%] w-10 h-10" />
      
      {/* Animated Basketball Ring */}
      <div className="absolute top-[15%] left-[12%] animate-pulse" style={{ animationDuration: "4s" }}>
        <BasketballRing className="w-20 h-16 text-primary/20" />
      </div>
      <div className="absolute bottom-[20%] right-[15%] animate-pulse" style={{ animationDuration: "5s" }}>
        <BasketballRing className="w-24 h-20 text-primary/25" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo with Animation */}
          <div 
            className={`flex justify-center mb-10 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                alt="宮崎 SELENE ロゴ"
                width={200}
                height={200}
                className="rounded-full shadow-2xl shadow-primary/30 relative z-10 hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Badge with Animation */}
          <div 
            className={`transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            style={{ transitionDelay: "0.2s" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-10 hover:bg-primary/20 transition-colors">
              <Trophy className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-base font-semibold text-primary">
                全国大会出場を目指して
              </span>
            </div>
          </div>

          {/* Main Headline with Animation */}
          <h1 
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground mb-8 leading-tight text-balance transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: "0.4s" }}
          >
            バスケで
            <br />
            <span className="text-primary relative">
              宮崎を元気に！
              <span className="absolute -inset-1 bg-primary/10 blur-lg -z-10" />
            </span>
          </h1>

          {/* Sub Headline with Animation */}
          <p
            className={`text-xl md:text-2xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl md:max-w-4xl mx-auto text-pretty leading-relaxed md:whitespace-nowrap transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            宮崎県の女子中学生バスケットボールクラブ「SELENE」。心身の健全な育成と、全国大会出場を目指して日々練習に励んでいます。
          </p>

          <div
            className={`max-w-3xl mx-auto mb-14 rounded-xl border border-amber-400/40 bg-amber-500/10 px-5 py-4 text-center transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: "0.8s" }}
          >
            <p className="text-sm md:text-base text-amber-100 leading-relaxed">
              お知らせ：今年度の募集は行なっておりません。
            </p>
          </div>

          {/* Stats with Animation */}
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: "0.9s" }}
          >
            {[
              { icon: Users, value: "10", label: "選手在籍" },
              { icon: Trophy, value: "1", label: "参加大会" },
            ].map((stat, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-5 md:p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 transition-all duration-300 group w-full"
              >
                <stat.icon className="h-7 w-7 md:h-8 md:w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm md:text-base text-muted-foreground mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground animate-pulse">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
