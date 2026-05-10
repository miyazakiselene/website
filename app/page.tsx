import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TeamAbout } from "@/components/team-about"
import { News } from "@/components/news"
import { Results } from "@/components/results"
import { InstagramFeed } from "@/components/instagram-feed"
import { ContactForm } from "@/components/contact-form"
import { Sponsors } from "@/components/sponsors"
import { Footer } from "@/components/footer"
import { parseInstagramEmbedPostUrlsFromEnv } from "@/lib/instagram-embed"

/** 本番で環境変数をビルド後に更新しても反映されるよう、トップはリクエスト時に env を読む */
export const dynamic = "force-dynamic"

export default function HomePage() {
  const embedRaw =
    process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URLS ?? process.env.INSTAGRAM_EMBED_URLS ?? ""
  const instagramEmbedPostUrls = parseInstagramEmbedPostUrlsFromEnv(embedRaw)

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <News />
      <TeamAbout />
      <Results />
      <InstagramFeed embedPostUrls={instagramEmbedPostUrls} />
      <ContactForm />
      <Sponsors />
      <Footer />
    </main>
  )
}
