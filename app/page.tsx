import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TeamAbout } from "@/components/team-about"
import { Results } from "@/components/results"
import { InstagramFeed } from "@/components/instagram-feed"
import { ContactForm } from "@/components/contact-form"
import { Sponsors } from "@/components/sponsors"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <TeamAbout />
      <Results />
      <InstagramFeed />
      <ContactForm />
      <Sponsors />
      <Footer />
    </main>
  )
}
