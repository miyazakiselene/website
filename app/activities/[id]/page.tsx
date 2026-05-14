import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { readActivityRecords } from "@/lib/activities"
import { formatActivityDateRangeJa, formatOpponentsDisplayJa } from "@/lib/activities-model"
import { siteDescriptionBrandPrefix, siteNameTemplate } from "@/lib/site-seo"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const items = await readActivityRecords()
  const item = items.find((a) => a.id === id)
  if (item == null) {
    return { title: "活動記録", robots: { index: false, follow: false } }
  }
  const opponents = formatOpponentsDisplayJa(item.opponent)
  const rawDesc =
    item.content.trim().length > 0
      ? item.content.trim()
      : [formatActivityDateRangeJa(item.startDate, item.endDate), item.location, opponents]
          .filter((s) => s.length > 0)
          .join(" — ")
  const description = `${siteDescriptionBrandPrefix}${rawDesc || "活動記録"}`.slice(0, 160)
  const fullTitle = `${item.title} | ${siteNameTemplate}`
  return {
    title: item.title,
    description,
    alternates: { canonical: `/activities/${id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      locale: "ja_JP",
    },
  }
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params
  const items = await readActivityRecords()
  const item = items.find((a) => a.id === id)
  if (item == null) notFound()

  const opponents = formatOpponentsDisplayJa(item.opponent)
  const dateLine = formatActivityDateRangeJa(item.startDate, item.endDate)

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "宮崎SELENE（セレーネ）", item: "/" },
      { "@type": "ListItem", position: 2, name: "活動記録・試合結果", item: "/#results" },
      { "@type": "ListItem", position: 3, name: item.title, item: `/activities/${id}` },
    ],
  }

  const sportsEvent = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: item.title,
    startDate: item.startDate,
    endDate: item.endDate,
    sport: "Basketball",
    location: {
      "@type": "Place",
      name: item.location || "宮崎県宮崎市",
      address: {
        "@type": "PostalAddress",
        addressRegion: "宮崎県",
        addressCountry: "JP",
      },
    },
    organizer: {
      "@type": "SportsTeam",
      name: "宮崎SELENE",
      url: "/",
    },
    ...(opponents.length > 0 ? { competitor: opponents } : {}),
    description: item.content.trim() || `宮崎SELENE（セレーネ）の活動記録 — ${dateLine}`,
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEvent) }}
      />
      <ClientOnly>
        <Header />
      </ClientOnly>
      <article className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href="/#results" className="font-medium text-primary underline-offset-4 hover:underline">
            活動記録・大会結果へ
          </Link>
        </p>
        <header className="mb-8 border-b border-border pb-8">
          <p className="mb-2 text-sm font-semibold text-primary md:text-base">{dateLine}</p>
          <h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">{item.title}</h1>
          <div className="mt-4 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{item.location}</span>
          </div>
          {opponents.length > 0 ? (
            <p className="mt-4 text-base text-foreground md:text-lg">
              <span className="font-semibold text-muted-foreground">対戦相手: </span>
              {opponents}
            </p>
          ) : null}
        </header>
        {item.content.trim().length > 0 ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground md:text-lg">
            {item.content}
          </div>
        ) : (
          <p className="text-muted-foreground">詳細の登録はありません。</p>
        )}
      </article>
      <Footer />
    </main>
  )
}
