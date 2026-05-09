import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '宮崎 SELENE',
    short_name: 'SELENE',
    description:
      '宮崎県の女子中学生バスケットボールクラブ「宮崎 SELENE」の公式サイトです。',
    start_url: '/',
    display: 'standalone',
    background_color: '#3d4450',
    theme_color: '#3d4450',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
