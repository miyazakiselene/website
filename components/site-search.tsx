"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Calendar, HelpCircle, LayoutGrid, Newspaper, Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const sectionIds = [
  { id: "about",         key: "pages.about" },
  { id: "news",          key: "pages.news" },
  { id: "results",       key: "pages.results" },
  { id: "faq",           key: "pages.faq" },
  { id: "contact",       key: "pages.contact" },
  { id: "related-links", key: "pages.relatedLinks" },
] as const

type NewsItem     = { id: string; title: string; date: string; venue: string }
type ActivityItem = { id: string; title: string; startDate: string; endDate: string; opponent: string; location: string }

export function SiteSearch() {
  const t      = useTranslations("search")
  const tNav   = useTranslations("nav")
  const tFaq   = useTranslations("faq")
  const [open, setOpen] = useState(false)
  const [newsItems, setNewsItems]         = useState<NewsItem[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const router = useRouter()

  const sections = [
    { id: "about",         label: tNav("about") },
    { id: "news",          label: tNav("news") },
    { id: "results",       label: tNav("results") },
    { id: "faq",           label: tNav("faq") },
    { id: "contact",       label: tNav("contact") },
    { id: "related-links", label: tNav("relatedLinks") },
  ]

  const faqItems = (tFaq.raw("items") as Array<{ question: string; answer: string }>).map(
    (item, i) => ({ id: `faq-${i}`, question: item.question }),
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.all([
      fetch("/api/news",       { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/activities", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([n, a]) => {
        if (cancelled) return
        if (Array.isArray(n?.items)) setNewsItems(n.items as NewsItem[])
        if (Array.isArray(a?.items)) setActivityItems(a.items as ActivityItem[])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [open])

  const handleSelect = (href: string) => {
    setOpen(false)
    if (href.startsWith("#")) {
      const id = href.slice(1)
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200)
    } else {
      router.push(href)
    }
  }

  return (
    <>
      {/* Desktop: search bar button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("ariaLabel")}
        className="hidden md:flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span>{t("desktopLabel")}</span>
        <span className="ml-1 flex items-center gap-px rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          ⌘K
        </span>
      </button>

      {/* Mobile: icon only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("ariaLabel")}
        className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg hover:bg-primary/10 transition-colors"
      >
        <Search className="h-5 w-5 text-foreground" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("ariaLabel")}
        description={t("dialogDescription")}
        showCloseButton={false}
        className="max-w-[95vw] md:max-w-lg"
      >
        <CommandInput placeholder={t("placeholder")} />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>{t("emptyResult")}</CommandEmpty>

          <CommandGroup heading={t("sections.pages")}>
            {sections.map((s) => (
              <CommandItem key={s.id} value={s.label} onSelect={() => handleSelect(`#${s.id}`)}>
                <LayoutGrid className="text-muted-foreground" />
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {newsItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("sections.news")}>
                {newsItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.venue} ${item.date}`}
                    onSelect={() => handleSelect(`/news/${item.id}`)}
                  >
                    <Newspaper className="shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.date}{item.venue ? ` — ${item.venue}` : ""}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {activityItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("sections.activities")}>
                {activityItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.opponent} ${item.location}`}
                    onSelect={() => handleSelect(`/activities/${item.id}`)}
                  >
                    <Calendar className="shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.startDate}
                        {item.startDate !== item.endDate ? ` 〜 ${item.endDate}` : ""}
                        {item.location ? ` — ${item.location}` : ""}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading={t("sections.faq")}>
            {faqItems.map((faq) => (
              <CommandItem
                key={faq.id}
                value={faq.question}
                onSelect={() => handleSelect("#faq")}
              >
                <HelpCircle className="shrink-0 text-muted-foreground" />
                <span className="truncate">{faq.question}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
