import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { readNewsRecords } from "@/lib/news"
import { siteDescriptionBrandPrefix, siteNameTemplate } from "@/lib/site-seo"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const items = await readNewsRecords()
  const item = items.find((n) => n.id === id)
  if (item == null) {
    return { title: "お知らせ", robots: { index: false, follow: false } }
  }
  const rawDesc =
    item.content != null && item.content.trim().length > 0
      ? item.content.trim()
      : `${item.venue} — ${item.date}`
  const description = `${siteDescriptionBrandPrefix}${rawDesc}`.slice(0, 160)
  const fullTitle = `${item.title} | ${siteNameTemplate}`
  return {
    title: item.title,
    description,
    alternates: { canonical: `/news/${id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      locale: "ja_JP",
    },
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params
  const items = await readNewsRecords()
  const item = items.find((n) => n.id === id)
  if (item == null) notFound()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "宮崎SELENE（セレーネ）", item: "/" },
      { "@type": "ListItem", position: 2, name: "お知らせ", item: "/#news" },
      { "@type": "ListItem", position: 3, name: item.title, item: `/news/${id}` },
    ],
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ClientOnly>
        <Header />
      </ClientOnly>
      <article className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href="/#news" className="font-medium text-primary underline-offset-4 hover:underline">
            お知らせ一覧へ
          </Link>
        </p>
        <header className="mb-8 border-b border-border pb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-primary md:text-base">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
            <span>{item.date}</span>
          </div>
          <h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">{item.title}</h1>
          <div className="mt-4 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{item.venue}</span>
          </div>
        </header>
        {item.content != null && item.content.trim().length > 0 ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground md:text-lg">
            {item.content}
          </div>
        ) : (
          <p className="text-muted-foreground">本文の登録はありません。</p>
        )}
      </article>
      <Footer />
    </main>
  )
}
