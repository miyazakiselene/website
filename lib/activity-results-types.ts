/** トップ「活動記録」セクション用（クライアント／サーバー共通） */
export type Match = {
  id: string
  date: string
  opponent: string
  /** 活動記録の本文など（任意） */
  content?: string
}

export type Tournament = {
  id: string
  /** 表示用期間文字列（日本語フォーマット済み、フォールバック用） */
  period: string
  /** 期間の開始日（YYYY-MM-DD）。ロケール対応フォーマットに使用 */
  startIso?: string
  /** 期間の終了日（YYYY-MM-DD）。ロケール対応フォーマットに使用 */
  endIso?: string
  year?: string
  name: string
  venue?: string
  matches: Match[]
}
