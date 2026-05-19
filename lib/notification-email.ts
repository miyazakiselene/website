import "server-only"

import { Resend } from "resend"

const TO_ADDRESS = "miyazakiselene@gmail.com"

function getResend(): Resend | null {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim()
  if (apiKey.length === 0) return null
  return new Resend(apiKey)
}

function getFromAddress(): string {
  return (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").trim()
}

export async function sendCheerMessageNotification(
  nickname: string,
  content: string,
): Promise<void> {
  const resend = getResend()
  if (resend === null) {
    console.warn("[notification-email] RESEND_API_KEY が未設定のためメール通知をスキップします")
    return
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: TO_ADDRESS,
    subject: `【応援メッセージ】${nickname}さんからのメッセージ`,
    text: [
      "公開サイトから応援メッセージが届きました。",
      "",
      `ニックネーム: ${nickname}`,
      `メッセージ:`,
      content,
      "",
      "---",
      "宮崎SELENE 応援メッセージ通知",
    ].join("\n"),
  })

  if (error) {
    console.error("[notification-email] メール送信エラー", error)
  }
}
