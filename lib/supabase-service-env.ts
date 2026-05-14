/**
 * サーバーで service_role を使う Supabase 連携が有効か（クライアントに import されても service key は見えないため false になるだけ）。
 */
export function isSupabaseServiceConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}
