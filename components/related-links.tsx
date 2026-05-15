"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ExternalLink, Link2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const linkUrls = [
  "https://miyachugaku.hp-ez.com/",
  "http://miyazaki.japanbasketball.jp/",
  "https://team-jba.jp/",
  "http://www.japanbasketball.jp/",
]

type RelatedLinkItem = {
  name: string
  url: string
  description: string
}

function RelatedLinkCard({ item }: { item: RelatedLinkItem }) {
  return (
    <Card className="border-border bg-background transition-colors duration-300 hover:border-primary/40">
      <CardContent className="p-5 md:p-7">
        <div className="space-y-2">
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-base font-bold text-foreground transition-colors hover:text-primary md:text-lg"
          >
            <span>{item.name}</span>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {item.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function MobileRelatedLinksList({ items, openLabel, closeLabel }: { items: RelatedLinkItem[]; openLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mx-auto max-w-4xl md:hidden">
      <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-center">
        <p className="text-base font-bold text-foreground">{openLabel}</p>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-4">
            {items.map((item, index) => (
              <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
                <RelatedLinkCard item={item} />
              </AnimatedSection>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
            {closeLabel}
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function RelatedLinks() {
  const t = useTranslations("relatedLinks")
  const rawItems = t.raw("items") as Array<{ name: string; description: string }>
  const items: RelatedLinkItem[] = rawItems.map((item, i) => ({
    ...item,
    url: linkUrls[i] ?? "#",
  }))

  return (
    <section id="related-links" className="bg-card py-24 md:py-28">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-14 text-center" animation="fadeInUp">
          <div className="mb-5 inline-flex items-center gap-2 text-primary">
            <Link2 className="h-5 w-5" />
            <span className="text-base font-semibold uppercase tracking-widest md:text-lg">
              {t("sectionLabel")}
            </span>
          </div>
          <h2 className="mb-6 text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t("description")}
          </p>
        </AnimatedSection>

        {/* Desktop: 1-column list */}
        <div className="mx-auto hidden max-w-4xl grid-cols-1 gap-4 md:grid md:gap-5">
          {items.map((item, index) => (
            <AnimatedSection key={item.url} animation="fadeInUp" delay={100 + index * 80}>
              <RelatedLinkCard item={item} />
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile: collapsible */}
        <MobileRelatedLinksList items={items} openLabel={t("openList")} closeLabel={t("closeList")} />
      </div>
    </section>
  )
}
