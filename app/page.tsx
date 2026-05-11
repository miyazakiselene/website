import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TeamAbout } from "@/components/team-about"
import { News } from "@/components/news"
import { Results } from "@/components/results"
import { InstagramFeed } from "@/components/instagram-feed"
import { ContactForm } from "@/components/contact-form"
import { ClientOnly } from "@/components/client-only"
import { Sponsors } from "@/components/sponsors"
import { Footer } from "@/components/footer"
import { parseInstagramEmbedPostUrlsFromEnv } from "@/lib/instagram-embed"

/** 本番で環境変数を更新しても反映されやすいよう、リクエスト時に読む */
export const dynamic = "force-dynamic"

const defaultInstagramEmbedPostUrls = [
  "https://www.instagram.com/p/DXlPRySCQap/",
  "https://www.instagram.com/p/DXlT6_0CdsN/",
  "https://www.instagram.com/p/DX1gb7PponQ/",
  "https://www.instagram.com/p/DX1nI-RpCTR/",
  "https://www.instagram.com/p/DYHji31JQR6/",
]

export default function HomePage() {
  const embedRaw =
    process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URLS ?? process.env.INSTAGRAM_EMBED_URLS ?? ""
  const instagramEmbedPostUrls = parseInstagramEmbedPostUrlsFromEnv(embedRaw)
  const effectiveInstagramEmbedPostUrls =
    instagramEmbedPostUrls.length > 0 ? instagramEmbedPostUrls : defaultInstagramEmbedPostUrls

  return (
    <main className="min-h-screen">
      <ClientOnly>
        <Header />
      </ClientOnly>
      <Hero />
      <News />
      <TeamAbout />
      <Results />
      <InstagramFeed embedPostUrls={effectiveInstagramEmbedPostUrls} />
      <ClientOnly>
        <ContactForm />
      </ClientOnly>
      <Sponsors />
      <Footer />
    </main>
  )
}
