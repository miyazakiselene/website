/**
 * クライアントでも import 可（server-only を置かない）。
 * 実際に Supabase で読み書きできるかはサーバー側で URL + service_role を検証する。
 */
export function isNewsSupabaseUrlConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())
}
