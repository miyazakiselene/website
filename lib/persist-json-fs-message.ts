/**
 * data/*.json への read/write が OS レベルで失敗したとき、errno からユーザー向け文面を返す。
 * （Vercel のサーバーレス等の読み取り専用 FS でよく EROFS / EACCES になる）
 */
export function persistJsonFilesystemUserMessage(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null
  const code = (error as NodeJS.ErrnoException).code
  if (typeof code !== "string") return null

  if (code === "ENOSPC") {
    return "ディスクの空き容量が不足しているため保存できません。"
  }
  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return "この実行環境ではデータファイルへ書き込めません。お知らせ・活動記録・試合結果の追加は、手元の PC でプロジェクトを開き `pnpm dev` を起動してから行うか、リポジトリ内の JSON を直接編集してコミットしてください。"
  }
  return null
}

/**
 * API の `detail` 用。`error.message` が空でも必ず非空になる（空だとクライアント側で詳細が表示されないため）。
 */
export function errorToDetailString(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message?.trim() ?? ""
    if (msg.length > 0) return msg
    const stackHead = error.stack?.split("\n").slice(0, 5).join("\n")?.trim()
    if (stackHead && stackHead.length > 0) return stackHead
    return error.name || "Error（メッセージなし）"
  }
  if (typeof error === "string") {
    const t = error.trim()
    return t.length > 0 ? t : "(空文字列)"
  }
  if (error === null || error === undefined) return String(error)
  try {
    const s = JSON.stringify(error)
    return s !== undefined && s !== "{}" ? s : String(error)
  } catch {
    return String(error)
  }
}
