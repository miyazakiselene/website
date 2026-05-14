/** 絶対 URL 用のサイトルート（末尾スラッシュなし）。`app/layout.tsx` の metadataBase と揃える。 */
export function getPublicSiteBaseHref(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? ""
  const fallback = "http://localhost:3000"
  if (raw.length === 0) {
    return new URL(fallback).href.replace(/\/$/, "")
  }
  try {
    return new URL(raw).href.replace(/\/$/, "")
  } catch {
    console.error("[getPublicSiteBaseHref] Invalid NEXT_PUBLIC_SITE_URL:", raw)
    return new URL(fallback).href.replace(/\/$/, "")
  }
}
