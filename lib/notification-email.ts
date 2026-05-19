import "server-only"

/**
 * 応援メッセージを Google フォームへ転送する。
 *
 * 必要な環境変数:
 *   GOOGLE_FORM_URL          - フォームの回答送信先 URL
 *                              例: https://docs.google.com/forms/d/e/〈ID〉/formResponse
 *   GOOGLE_FORM_ENTRY_NICKNAME - ニックネーム欄のエントリー ID（例: entry.123456789）
 *   GOOGLE_FORM_ENTRY_CONTENT  - メッセージ欄のエントリー ID（例: entry.987654321）
 *
 * エントリー ID の調べ方:
 *   Google フォームを開き「回答を送信」→ URL に含まれる entry.XXXXXXXXX を確認するか、
 *   ブラウザの開発者ツールでフォームの <input name="entry.XXXXX"> を確認する。
 */

function getGoogleFormConfig(): { url: string; entryNickname: string; entryContent: string } | null {
  const url = (process.env.GOOGLE_FORM_URL ?? "").trim()
  const entryNickname = (process.env.GOOGLE_FORM_ENTRY_NICKNAME ?? "").trim()
  const entryContent = (process.env.GOOGLE_FORM_ENTRY_CONTENT ?? "").trim()

  if (url.length === 0 || entryNickname.length === 0 || entryContent.length === 0) {
    return null
  }

  return { url, entryNickname, entryContent }
}

export async function sendCheerMessageNotification(
  nickname: string,
  content: string,
): Promise<void> {
  const config = getGoogleFormConfig()
  if (config === null) {
    console.warn("[notification] GOOGLE_FORM_URL / ENTRY_NICKNAME / ENTRY_CONTENT が未設定のため転送をスキップします")
    return
  }

  const body = new URLSearchParams({
    [config.entryNickname]: nickname,
    [config.entryContent]: content,
  })

  try {
    await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
  } catch (error) {
    console.error("[notification] Google フォームへの転送に失敗しました", error)
  }
}
