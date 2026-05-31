import { isValid, parseISO } from "date-fns"
import { NextResponse } from "next/server"
import { readActivityRecords } from "@/lib/activities"
import { readNewsRecords } from "@/lib/news"
import { getPublicSiteBaseHref } from "@/lib/site-base"
import { getSiteLastUpdatedDate } from "@/lib/site-last-updated"

export const dynamic = "force-dynamic"

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function formatLastmod(d: Date): string {
  return d.toISOString().split("T")[0] ?? ""
}

function lastModFromIsoDate(value: string | undefined): Date | undefined {
  if (value == null || value.trim() === "") return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

export async function GET() {
  const base = getPublicSiteBaseHref()
  const [newsItems, activityItems, siteLastUpdated] = await Promise.all([
    readNewsRecords(),
    readActivityRecords(),
    getSiteLastUpdatedDate(),
  ])

  type Row = { loc: string; lastmod: string; changefreq: string; priority: string }
  // トップページの lastmod は実際の最終更新日（お知らせ/活動記録/Instagram/その他修正の最新日）
  const home = formatLastmod(siteLastUpdated)
  const rows: Row[] = [
    { loc: `${base}/`,    lastmod: home, changefreq: "weekly", priority: "1.0" },
    { loc: `${base}/en/`, lastmod: home, changefreq: "weekly", priority: "1.0" },
    ...newsItems.flatMap((item) => {
      const d = lastModFromIsoDate(item.eventEndDate)
      const lastmod = formatLastmod(d ?? new Date())
      const id = encodeURIComponent(item.id)
      return [
        { loc: `${base}/news/${id}`,    lastmod, changefreq: "weekly", priority: "0.8" },
        { loc: `${base}/en/news/${id}`, lastmod, changefreq: "weekly", priority: "0.8" },
      ]
    }),
    ...activityItems.flatMap((item) => {
      const d = lastModFromIsoDate(item.endDate)
      const lastmod = formatLastmod(d ?? new Date())
      const id = encodeURIComponent(item.id)
      return [
        { loc: `${base}/activities/${id}`,    lastmod, changefreq: "weekly", priority: "0.75" },
        { loc: `${base}/en/activities/${id}`, lastmod, changefreq: "weekly", priority: "0.75" },
      ]
    }),
  ]

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    rows
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${escapeXml(u.loc)}</loc>\n` +
          `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n` +
          `  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
