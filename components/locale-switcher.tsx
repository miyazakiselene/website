"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter, routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale  = useLocale()
  const router  = useRouter()
  const pathname = usePathname()

  const switchLocale = (next: string) => {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5 text-xs font-bold",
        className,
      )}
      aria-label="言語切り替え / Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            locale === l
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
