import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import {
  primaryBrandImageAlt,
  siteDescriptionDefault,
  siteNameTemplate,
  siteTitleDefault,
} from '@/lib/site-seo'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL != null && process.env.NEXT_PUBLIC_SITE_URL !== ''
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL('http://localhost:3000')

const ogImageUrl = new URL('/images/team-gallery/team-05-group.png', siteUrl).toString()
const logoImageUrl = new URL('/icon-512.png', siteUrl).toString()
const instagramUrl = 'https://www.instagram.com/2026.selene/'

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteNameTemplate,
  title: {
    default: siteTitleDefault,
    template: `%s | ${siteNameTemplate}`,
  },
  description: siteDescriptionDefault,
  keywords: [
    '宮崎 中学 バスケ',
    '宮崎市 中学女子バスケ',
    '宮崎 中学女子バスケットボール',
    '宮崎SELENE',
    'SELENE',
    'セレーネ',
    'セレネ',
    '宮崎 セレーネ',
    '宮崎 バスケットボール 中学',
    '宮崎市 バスケットボール クラブチーム',
    '宮崎県 中学バスケ',
    '宮崎市 中学バスケ',
    '中学女子バスケットボール 宮崎',
    '宮崎 練習試合 バスケットボール',
    '宮崎 カップ戦 バスケットボール',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: siteNameTemplate,
    title: siteTitleDefault,
    description: siteDescriptionDefault,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: primaryBrandImageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitleDefault,
    description: siteDescriptionDefault,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'hPBjVcxHIoxVAD5YeyPkUlmKEOAq-Wnp97qEWv7OsMs',
  },
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
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: '宮崎SELENE',
    alternateName: ['セレーネ', 'セレネ'],
    description: siteDescriptionDefault,
    sport: 'Basketball',
    url: siteUrl.toString(),
    logo: logoImageUrl,
    image: [ogImageUrl],
    sameAs: [instagramUrl],
    areaServed: {
      '@type': 'AdministrativeArea',
      name: '宮崎県',
    },
    location: {
      '@type': 'Place',
      name: '宮崎県宮崎市',
      address: {
        '@type': 'PostalAddress',
        addressLocality: '宮崎市',
        addressRegion: '宮崎県',
        addressCountry: 'JP',
      },
    },
  }

  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {process.env.NODE_ENV === 'production' ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  )
}
