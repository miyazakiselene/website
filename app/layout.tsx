import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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

const siteName = '宮崎 SELENE'
const siteTitle = '宮崎 SELENE | 宮崎県の中学バスケットボールチーム公式サイト'
const siteDescription =
  '宮崎 SELENEは宮崎県宮崎市を拠点に活動する中学バスケットボールチームです。活動記録や大会情報を発信し、練習試合・カップ戦・大会のお誘いも歓迎しています。'
const ogImageUrl = new URL('/images/team-gallery/team-05-group.png', siteUrl).toString()
const logoImageUrl = new URL('/icon-512.png', siteUrl).toString()
const instagramUrl = 'https://www.instagram.com/2026.selene/'

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    '宮崎 SELENE',
    '宮崎 バスケットボール 中学',
    '宮崎市 バスケットボール クラブチーム',
    'SELENE バスケ',
    '宮崎県 中学バスケ 練習',
    '宮崎県中学バスケットボール',
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
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: '宮崎 SELENE の活動風景',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
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
  category: 'sports',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
    '@type': 'SportsOrganization',
    name: siteName,
    alternateName: '宮崎 SELENE バスケットボールクラブ',
    description: siteDescription,
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
