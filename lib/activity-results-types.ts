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
  period: string
  year?: string
  name: string
  venue?: string
  matches: Match[]
}
