/** 絶対 URL 用のサイトルート（末尾スラッシュなし）。`app/layout.tsx` の metadataBase と揃える。 */
export function getPublicSiteBaseHref(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL != null && process.env.NEXT_PUBLIC_SITE_URL !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "http://localhost:3000"
  return new URL(raw).href.replace(/\/$/, "")
}
