import "server-only"

import { getSupabaseServiceClient } from "@/lib/supabase-admin-client"
import { isSupabaseServiceConfigured } from "@/lib/supabase-service-env"

const TABLE = "team_gallery_manifest"
const BUCKET = "team-gallery"
const PRIMARY_ID = "primary"

/** `lib/team-images.ts` のマニフェストと同形（循環 import 回避のためここで定義） */
export type TeamGalleryManifestPayload = {
  version: 1
  updatedAt: string
  images: unknown[]
  hiddenDefaultImageIds?: string[]
  photoOrder?: string[]
}

export function isTeamGallerySupabaseEnabled(): boolean {
  return isSupabaseServiceConfigured()
}

export async function readTeamGalleryManifestPayloadFromSupabase(): Promise<TeamGalleryManifestPayload | null> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from(TABLE).select("manifest").eq("id", PRIMARY_ID).maybeSingle()

  if (error) throw error
  if (data == null) return null

  const raw = data.manifest
  if (raw === null || typeof raw !== "object") return null

  const obj = raw as Partial<TeamGalleryManifestPayload>
  if (obj.version !== 1 || typeof obj.updatedAt !== "string" || !Array.isArray(obj.images)) {
    return null
  }

  return {
    version: 1,
    updatedAt: obj.updatedAt,
    images: obj.images,
    hiddenDefaultImageIds: Array.isArray(obj.hiddenDefaultImageIds) ? obj.hiddenDefaultImageIds : undefined,
    photoOrder: Array.isArray((obj as Partial<TeamGalleryManifestPayload>).photoOrder)
      ? (obj as Partial<TeamGalleryManifestPayload>).photoOrder
      : undefined,
  }
}

export async function writeTeamGalleryManifestPayloadToSupabase(
  manifest: TeamGalleryManifestPayload,
): Promise<void> {
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from(TABLE).upsert(
    {
      id: PRIMARY_ID,
      manifest,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) throw error
}

export async function uploadTeamGalleryObjectToSupabase(
  objectPath: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<{ pathname: string; publicUrl: string }> {
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType,
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  return { pathname: objectPath, publicUrl: data.publicUrl }
}

export async function deleteTeamGalleryObjectsFromSupabase(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}
