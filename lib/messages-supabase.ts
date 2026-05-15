import "server-only"

import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "messages"

export const MESSAGE_NICKNAME_MAX = 30
export const MESSAGE_CONTENT_MAX  = 100

export type MessageRecord = {
  id: string
  created_at: string
  nickname: string
  content: string
  is_approved: boolean
}

export function isMessagesSupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

export async function insertMessage(nickname: string, content: string): Promise<void> {
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from(TABLE).insert({ nickname, content })
  if (error) throw error
}

export async function listMessages(): Promise<MessageRecord[]> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,created_at,nickname,content,is_approved")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as MessageRecord[]
}

export async function deleteMessageById(id: string): Promise<void> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id")
  if (error) throw error
  if (!data?.length) throw new Error("MESSAGE_NOT_FOUND")
}

export async function approveMessageById(id: string): Promise<void> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ is_approved: true })
    .eq("id", id)
    .select("id")
  if (error) throw error
  if (!data?.length) throw new Error("MESSAGE_NOT_FOUND")
}
