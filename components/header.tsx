"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { primaryBrandImageAlt } from "@/lib/site-seo"
import { cn } from "@/lib/utils"
import { SiteSearch } from "@/components/site-search"

const navItems = [
  { label: "ホーム", href: "#hero" },
  { label: "チーム紹介", href: "#about" },
  { label: "お知らせ", href: "#news" },
  { label: "活動記録", href: "#results" },
  { label: "FAQ", href: "#faq" },
  { label: "お問い合わせ", href: "#contact" },
  { label: "Instagram", href: "#instagram" },
  { label: "関連リンク", href: "#related-links" },
  { label: "関係者専用", href: "/staff" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Detect active section
      const sections = navItems.map(item => item.href.replace("#", ""))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-background/10" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 transition-transform group-hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                alt={primaryBrandImageAlt}
                fill
                sizes="48px"
                className="z-10 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                宮崎 SELENE
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Girls Basketball Club
              </span>
            </div>
          </Link>

          {/* Desktop Navigation + 検索 + Mobile controls */}
          <div className="flex items-center gap-1">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                    activeSection === item.href.replace("#", "")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {activeSection === item.href.replace("#", "") && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            <SiteSearch />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-2 px-3 hover:bg-primary/10"
                aria-label="メニューを開く"
              >
                <Menu className="h-6 w-6 shrink-0" aria-hidden />
                <span className="text-sm font-semibold tracking-wide text-foreground">MENU</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetHeader className="sr-only">
                <SheetTitle>サイトメニュー</SheetTitle>
                <SheetDescription>
                  各セクションへのリンク一覧です。
                </SheetDescription>
              </SheetHeader>
              <div className="mb-8 mt-4 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eXDGmvyWRf4K2shMMCmWbrlTBM5TWt.png"
                    alt={primaryBrandImageAlt}
                    fill
                    sizes="40px"
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-lg font-bold text-foreground">宮崎 SELENE</span>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const itemClass = cn(
                    "w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors hover:bg-primary/10",
                    activeSection === item.href.replace("#", "")
                      ? "text-primary bg-primary/5"
                      : "text-foreground"
                  )
                  if (item.href.startsWith("#")) {
                    return (
                      <SheetClose key={item.href} asChild>
                        <button
                          type="button"
                          className={itemClass}
                          onClick={() => {
                            const id = item.href.slice(1)
                            setTimeout(() => {
                              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                            }, 300)
                          }}
                        >
                          {item.label}
                        </button>
                      </SheetClose>
                    )
                  }
                  return (
                    <SheetClose key={item.href} asChild>
                      <Link href={item.href} className={itemClass}>
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
