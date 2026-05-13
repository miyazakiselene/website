import { promises as fs } from "node:fs"
import path from "node:path"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TeamAbout } from "@/components/team-about"
import { News } from "@/components/news"
import { Results, type Tournament } from "@/components/results"
import { RelatedLinks } from "@/components/related-links"
import { InstagramFeed } from "@/components/instagram-feed"
import { ContactForm } from "@/components/contact-form"
import { ClientOnly } from "@/components/client-only"
import { Sponsors } from "@/components/sponsors"
import { Footer } from "@/components/footer"
import { parseInstagramEmbedPostUrlsFromEnv } from "@/lib/instagram-embed"
import { getPublicTeamGallery } from "@/lib/team-images"
import { readNewsRecords } from "@/lib/news"

/** 本番で環境変数を更新しても反映されやすいよう、リクエスト時に読む */
export const dynamic = "force-dynamic"

const defaultInstagramEmbedPostUrls = [
  "https://www.instagram.com/p/DXlPRySCQap/",
  "https://www.instagram.com/p/DXlT6_0CdsN/",
  "https://www.instagram.com/p/DX1gb7PponQ/",
  "https://www.instagram.com/p/DX1nI-RpCTR/",
  "https://www.instagram.com/p/DYHji31JQR6/",
]

const MAX_VISIBLE_INSTAGRAM_POSTS = 9

type StaffRecord = {
  id: string
  year: string
  name: string
  venue?: string
  matches?: {
    id: string
    date: string
    opponent: string
  }[]
}

async function readInitialPublicResults(): Promise<Tournament[] | undefined> {
  const dataFile = path.join(process.cwd(), "data", "staff-records.json")

  try {
    const raw = await fs.readFile(dataFile, "utf-8")
    const parsed = JSON.parse(raw) as StaffRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return undefined

    return parsed.map((record) => ({
      id: record.id,
      period: record.year,
      year: record.year,
      name: record.name,
      venue: record.venue ?? "",
      matches: Array.isArray(record.matches)
        ? record.matches.map((match) => ({
            id: match.id,
            date: match.date,
            opponent: match.opponent,
          }))
        : [],
    }))
  } catch {
    return undefined
  }
}

export default async function HomePage() {
  const embedRaw =
    process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URLS ?? process.env.INSTAGRAM_EMBED_URLS ?? ""
  const instagramEmbedPostUrls = parseInstagramEmbedPostUrlsFromEnv(embedRaw)
  const effectiveInstagramEmbedPostUrls =
    (instagramEmbedPostUrls.length > 0 ? instagramEmbedPostUrls : defaultInstagramEmbedPostUrls).slice(
      0,
      MAX_VISIBLE_INSTAGRAM_POSTS,
    )
  const initialPublicResults = await readInitialPublicResults()
  const { photos: teamGalleryPhotos } = await getPublicTeamGallery()
  const newsItems = await readNewsRecords()

  return (
    <main className="min-h-screen">
      <ClientOnly>
        <Header />
      </ClientOnly>
      <Hero />
      <News initialItems={newsItems} />
      <TeamAbout galleryPhotos={teamGalleryPhotos} />
      <Results initialTournaments={initialPublicResults} />
      <InstagramFeed embedPostUrls={effectiveInstagramEmbedPostUrls} />
      <RelatedLinks />
      <ClientOnly>
        <ContactForm />
      </ClientOnly>
      <Sponsors />
      <Footer />
    </main>
  )
}
