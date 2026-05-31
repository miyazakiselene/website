import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TeamAbout } from "@/components/team-about"
import { News } from "@/components/news"
import { Results } from "@/components/results"
import { CheerMessageForm } from "@/components/cheer-message-form"
import { FaqSection } from "@/components/faq-section"
import { RelatedLinks } from "@/components/related-links"
import { InstagramFeed } from "@/components/instagram-feed"
import { ContactForm } from "@/components/contact-form"
import { ClientOnly } from "@/components/client-only"
import { Sponsors } from "@/components/sponsors"
import { Footer } from "@/components/footer"
import { readActivityRecords } from "@/lib/activities"
import { sortMatchesNewestFirst, sortTournamentsNewestFirst } from "@/lib/activity-records-sort"
import type { Tournament } from "@/lib/activity-results-types"
import { parseInstagramEmbedPostUrlsFromEnv } from "@/lib/instagram-embed"
import { mapActivitiesToTournaments } from "@/lib/map-activities-to-tournaments"
import { filterStaffTournamentsForPublicTop } from "@/lib/public-results-dedupe"
import { getPublicTeamGallery } from "@/lib/team-images"
import { readNewsRecords } from "@/lib/news"
import { readStaffTournamentRecords } from "@/lib/staff-results-storage"
import { getSiteLastUpdatedIso } from "@/lib/site-last-updated"
import { getPublicSiteBaseHref } from "@/lib/site-base"
import { siteDescriptionDefault, siteTitleDefault } from "@/lib/site-seo"

export const dynamic = "force-dynamic"

const defaultInstagramEmbedPostUrls = [
  "https://www.instagram.com/p/DXlPRySCQap/",
  "https://www.instagram.com/p/DXlT6_0CdsN/",
  "https://www.instagram.com/p/DX1gb7PponQ/",
  "https://www.instagram.com/p/DX1nI-RpCTR/",
  "https://www.instagram.com/p/DYHji31JQR6/",
]

const MAX_VISIBLE_INSTAGRAM_POSTS = 9

async function readStaffRecordsAsTournaments(): Promise<Tournament[]> {
  const parsed = await readStaffTournamentRecords()
  if (parsed.length === 0) return []
  return parsed.map((record) => ({
    id: record.id,
    period: record.year,
    year: record.year,
    name: record.name,
    venue: record.venue ?? "",
    matches: Array.isArray(record.matches)
      ? record.matches.map((match) => ({ id: match.id, date: match.date, opponent: match.opponent }))
      : [],
  }))
}

async function readMergedPublicResults(): Promise<Tournament[] | undefined> {
  const [staff, activityRecords] = await Promise.all([readStaffRecordsAsTournaments(), readActivityRecords()])
  const staffForTop = filterStaffTournamentsForPublicTop(staff)
  const fromActivities = mapActivitiesToTournaments(activityRecords)
  const combined = [...staffForTop, ...fromActivities]
  if (combined.length === 0) return undefined
  const sortedTournaments = sortTournamentsNewestFirst(combined)
  return sortedTournaments.map((tournament) => ({
    ...tournament,
    matches: sortMatchesNewestFirst(
      tournament.matches,
      tournament.year !== undefined
        ? { id: tournament.id, year: tournament.year }
        : { id: tournament.id, period: tournament.period },
    ),
  }))
}

export default async function HomePage() {
  const embedRaw = process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URLS ?? process.env.INSTAGRAM_EMBED_URLS ?? ""
  const instagramEmbedPostUrls = parseInstagramEmbedPostUrlsFromEnv(embedRaw)
  const effectiveInstagramEmbedPostUrls =
    (instagramEmbedPostUrls.length > 0 ? instagramEmbedPostUrls : defaultInstagramEmbedPostUrls).slice(0, MAX_VISIBLE_INSTAGRAM_POSTS)
  const initialPublicResults = await readMergedPublicResults()
  const { photos: teamGalleryPhotos } = await getPublicTeamGallery()
  const newsItems = await readNewsRecords()
  const lastUpdatedIso = await getSiteLastUpdatedIso()

  const siteBase = getPublicSiteBaseHref()
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitleDefault,
    description: siteDescriptionDefault,
    url: siteBase,
    inLanguage: "ja-JP",
    dateModified: lastUpdatedIso,
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <ClientOnly>
        <Header />
      </ClientOnly>
      <Hero />
      <TeamAbout galleryPhotos={teamGalleryPhotos} />
      <News initialItems={newsItems} />
      <Results initialTournaments={initialPublicResults} />
      <CheerMessageForm />
      <FaqSection />
      <ClientOnly>
        <ContactForm />
      </ClientOnly>
      <InstagramFeed embedPostUrls={effectiveInstagramEmbedPostUrls} />
      <RelatedLinks />
      <Sponsors />
      <Footer lastUpdatedIso={lastUpdatedIso} />
    </main>
  )
}
