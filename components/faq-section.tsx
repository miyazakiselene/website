"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

function FaqList({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <dl className="space-y-4">
      {items.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card px-6 py-5 space-y-2"
        >
          <dt className="font-bold text-foreground text-base md:text-lg leading-snug">
            <span className="text-primary mr-2" aria-hidden>
              Q.
            </span>
            {faq.question}
          </dt>
          <dd className="text-muted-foreground text-sm md:text-base leading-relaxed pl-6">
            {faq.answer}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type FaqSectionProps = {
  /** 「どんな大会に出場していますか？」の回答を参加状況に応じて差し替える（任意） */
  tournamentFaqAnswer?: string
}

function isTournamentFaqQuestion(question: string): boolean {
  return question.includes("大会") || /tournament/i.test(question)
}

export function FaqSection({ tournamentFaqAnswer }: FaqSectionProps = {}) {
  const t = useTranslations("faq")
  const rawItems = t.raw("items") as Array<{ question: string; answer: string }>
  const items =
    tournamentFaqAnswer != null
      ? rawItems.map((item) =>
          isTournamentFaqQuestion(item.question) ? { ...item, answer: tournamentFaqAnswer } : item,
        )
      : rawItems

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            {t("sectionLabel")}
          </span>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-black text-foreground mt-3 mb-4"
          >
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("description")}
          </p>
        </div>

        <div className="hidden md:block">
          <FaqList items={items} />
        </div>

        <Collapsible defaultOpen={false} className="md:hidden">
          <CollapsibleTrigger className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-center">
            <p className="text-base font-bold text-foreground">{t("openList")}</p>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border pt-4">
              <FaqList items={items} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  )
}
