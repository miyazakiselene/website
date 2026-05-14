import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

export function getSupabaseServiceClient(): SupabaseClient {
  if (!isSupabaseServiceConfigured()) {
    throw new Error("Supabase が未設定です。NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。")
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
