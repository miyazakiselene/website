"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

const sections = [
  { id: "about",         label: "チーム紹介" },
  { id: "news",          label: "お知らせ" },
  { id: "results",       label: "活動記録" },
  { id: "faq",           label: "よくある質問" },
  { id: "contact",       label: "お問い合わせ" },
  { id: "related-links", label: "関連リンク" },
]

const faqItems = [
  { id: "faq-0", question: "宮崎SELENEとはどのようなチームですか？" },
  { id: "faq-1", question: "どこで練習・活動していますか？" },
  { id: "faq-2", question: "新メンバーの募集はしていますか？" },
  { id: "faq-3", question: "どんな大会に出場していますか？" },
  { id: "faq-4", question: "セレーネ（SELENE）という名前の由来は？" },
]

type NewsItem     = { id: string; title: string; date: string; venue: string }
type ActivityItem = { id: string; title: string; startDate: string; endDate: string; opponent: string; location: string }

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [newsItems, setNewsItems]         = useState<NewsItem[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const router = useRouter()

  // ⌘K / Ctrl+K でダイアログを開閉
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

  // ダイアログを開いたときにデータ取得
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
      {/* デスクトップ: 検索バー風ボタン */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="サイト内検索"
        className="hidden md:flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span>検索...</span>
        <span className="ml-1 flex items-center gap-px rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          ⌘K
        </span>
      </button>

      {/* スマホ: アイコンのみ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="検索"
        className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg hover:bg-primary/10 transition-colors"
      >
        <Search className="h-5 w-5 text-foreground" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="サイト内検索"
        description="お知らせ・活動記録・FAQ を検索できます"
        showCloseButton={false}
        className="max-w-[95vw] md:max-w-lg"
      >
        <CommandInput placeholder="キーワードを入力..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>一致する項目が見つかりませんでした。</CommandEmpty>

          <CommandGroup heading="ページ">
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
              <CommandGroup heading="お知らせ">
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
              <CommandGroup heading="活動記録">
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
          <CommandGroup heading="よくある質問">
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
