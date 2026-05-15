import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [{ source: "/sitemap.xml", destination: "/api/sitemap" }],
    }
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
  },
}

export default withNextIntl(nextConfig)
