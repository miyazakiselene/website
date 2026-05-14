"use client"

import { Instagram, ArrowUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { primaryBrandImageAlt } from "@/lib/site-seo"

const navLinks = [
  { label: "ホーム", href: "#hero" },
  { label: "チーム紹介", href: "#about" },
  { label: "お知らせ", href: "#news" },
  { label: "活動記録", href: "#results" },
  { label: "FAQ", href: "#faq" },
  { label: "お問い合わせ", href: "#contact" },
  { label: "Instagram", href: "#instagram" },
  { label: "関連リンク", href: "#related-links" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-secondary/50 border-t border-border py-16 relative">
      {/* Back to Top Button */}
      <AnimatedSection animation="fadeIn" className="absolute -top-7 left-1/2 -translate-x-1/2">
        <Button
          onClick={scrollToTop}
          size="icon"
          className="rounded-full shadow-lg hover:scale-110 transition-transform w-14 h-14"
        >
          <ArrowUp className="h-6 w-6" />
          <span className="sr-only">トップへ戻る</span>
        </Button>
      </AnimatedSection>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Logo & Description */}
          <AnimatedSection animation="fadeInUp" delay={100}>
            <Link href="/" className="flex items-center gap-4 mb-5 group">
              <div className="relative h-14 w-14 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                  alt={primaryBrandImageAlt}
                  fill
                  sizes="56px"
                  className="z-10 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  宮崎 SELENE
                </span>
                <span className="text-sm text-muted-foreground">
                  Girls Basketball Club
                </span>
              </div>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed">
              宮崎県の女子中学生バスケットボールクラブ「SELENE（セレーネ）」。
              <br />
              全国大会出場を目指して活動中。
            </p>
          </AnimatedSection>

          {/* Navigation */}
          <AnimatedSection animation="fadeInUp" delay={200}>
            <h4 className="font-bold text-lg text-foreground mb-5">ナビゲーション</h4>
            <nav className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-muted-foreground hover:text-primary hover:translate-x-1 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection animation="fadeInUp" delay={300}>
            <h4 className="font-bold text-lg text-foreground mb-5">お問い合わせ</h4>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/2026.selene/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-base text-muted-foreground hover:text-primary transition-colors group"
              >
                <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                @2026.selene（DMはこちら）
              </a>
              <Link
                href="/staff"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                チーム関係者専用ページ
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Copyright */}
        <AnimatedSection animation="fadeIn" delay={400}>
          <div className="border-t border-border pt-10">
            <p className="text-center text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} 宮崎 SELENE (セレーネ). All rights reserved.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  )
}
