/** 公式 embed.js が扱える投稿・リール・TV の permalink のみ（プロフィールURLは除外） */
export function isInstagramPostEmbedUrl(url: string): boolean {
  return /instagram\.com\/(?:[^/]+\/)?(p|reel|tv)\//i.test(url)
}

/**
 * カンマ区切りの URL 文字列から埋め込み対象の投稿URLだけを返す。
 * サーバー（app/page 等）で読むことで、ビルド後に変えた環境変数も反映しやすくする。
 */
export function parseInstagramEmbedPostUrlsFromEnv(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http"))
    .filter(isInstagramPostEmbedUrl)
}
