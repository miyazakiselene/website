import type { MetadataRoute } from "next"
import { isValid, parseISO } from "date-fns"
import { readActivityRecords } from "@/lib/activities"
import { readNewsRecords } from "@/lib/news"
import { getPublicSiteBaseHref } from "@/lib/site-base"

export const dynamic = "force-dynamic"

function lastModFromIsoDate(value: string | undefined): Date | undefined {
  if (value == null || value.trim() === "") return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteBaseHref()
  const [newsItems, activityItems] = await Promise.all([readNewsRecords(), readActivityRecords()])

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...newsItems.map((item) => ({
      url: `${base}/news/${encodeURIComponent(item.id)}`,
      lastModified: lastModFromIsoDate(item.eventEndDate) ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...activityItems.map((item) => ({
      url: `${base}/activities/${encodeURIComponent(item.id)}`,
      lastModified: lastModFromIsoDate(item.endDate) ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ]

  return entries
}
