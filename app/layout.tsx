import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { siteDescriptionDefault, siteNameTemplate, siteTitleDefault } from "@/lib/site-seo"
import { getPublicSiteBaseHref } from "@/lib/site-base"
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const siteUrl     = new URL(getPublicSiteBaseHref())
const ogImageUrl  = new URL('/images/team-gallery/team-05-group.png', siteUrl).toString()
const logoImageUrl = new URL('/icon-512.png', siteUrl).toString()
const instagramUrl = 'https://www.instagram.com/2026.selene/'
const googleMapsUrl = 'https://www.google.com/maps/place/%E5%AE%AE%E5%B4%8ESELENE/data=!4m2!3m1!1s0x0:0x7628381bc4bccf7d'

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteNameTemplate,
  title: { default: siteTitleDefault, template: `%s | ${siteNameTemplate}` },
  description: siteDescriptionDefault,
  keywords: [
    "宮崎 バスケ","宮崎のバスケ","宮崎バスケ","宮崎市 バスケ","宮崎県 バスケ",
    "宮崎 中学 バスケ","宮崎市 中学女子バスケ","宮崎 中学女子バスケットボール",
    "宮崎SELENE","SELENE","セレーネ","セレネ","宮崎 セレーネ",
    "宮崎 バスケットボール 中学","宮崎市 バスケットボール クラブチーム",
    "宮崎県 中学バスケ","宮崎市 中学バスケ","中学女子バスケットボール 宮崎",
    "Miyazaki basketball","girls basketball club Miyazaki","SELENE basketball",
  ],
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: { google: 'hPBjVcxHIoxVAD5YeyPkUlmKEOAq-Wnp97qEWv7OsMs' },
  category: 'sports',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0f172a',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // next-intl middleware が x-next-intl-locale ヘッダーをセットする
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') ?? 'ja'

  const baseHref    = siteUrl.toString().replace(/\/$/, "")
  const sportsTeamId = `${baseHref}/#sports-team`
  const websiteId   = `${baseHref}/#website`

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsTeam",
        "@id": sportsTeamId,
        name: "宮崎SELENE",
        alternateName: ["セレーネ","セレネ","SELENE","宮崎セレーネ","Miyazaki SELENE","宮崎 セレーネ"],
        description: siteDescriptionDefault,
        keywords: "宮崎 バスケ,宮崎のバスケ,セレーネ,SELENE,中学女子,バスケットボール,宮崎市,宮崎県,クラブチーム",
        sport: "Basketball",
        url: siteUrl.toString(),
        logo: { "@type": "ImageObject", url: logoImageUrl, width: 512, height: 512 },
        image: [{ "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 }],
        sameAs: [instagramUrl, siteUrl.toString(), googleMapsUrl],
        areaServed: { "@type": "AdministrativeArea", name: "宮崎県", containedInPlace: { "@type": "State", name: "宮崎県", addressCountry: "JP" } },
        location: { "@type": "Place", name: "宮崎県宮崎市", address: { "@type": "PostalAddress", addressLocality: "宮崎市", addressRegion: "宮崎県", addressCountry: "JP" } },
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: `${siteUrl.toString()}#contact`, availableLanguage: ["Japanese","English"] },
        gender: "Female",
        athlete: { "@type": "Person", description: "宮崎県の中学女子バスケットボール選手" },
      },
      {
        "@type": "WebSite", "@id": websiteId,
        url: siteUrl.toString(), name: siteTitleDefault, description: siteDescriptionDefault,
        inLanguage: locale === "en" ? "en-US" : "ja-JP",
        publisher: { "@id": sportsTeamId },
      },
    ],
  }

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {process.env.NODE_ENV === 'production' ? (<><Analytics /><SpeedInsights /></>) : null}
      </body>
    </html>
  )
}
