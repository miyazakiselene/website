import type { MetadataRoute } from "next"
import { getPublicSiteBaseHref } from "@/lib/site-base"

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteBaseHref()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staff/", "/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
