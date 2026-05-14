/**
 * クライアントでも import 可（server-only を置かない）。
 * 実際に Supabase で読み書きできるかはサーバー側で URL + service_role を検証する。
 * お知らせ・活動記録の Vercel プレビュー保存可否のヒントにも使う。
 */
export function isNewsSupabaseUrlConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())
}
