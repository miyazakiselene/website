import "server-only"

import { randomUUID } from "node:crypto"
import { del, list, put } from "@vercel/blob"
import {
  DEFAULT_TEAM_GALLERY_PHOTOS,
  type TeamGalleryPhoto,
} from "@/lib/team-gallery-defaults"

const TEAM_IMAGE_MANIFEST_PATH = "team-gallery/manifest.json"
const TEAM_IMAGE_UPLOAD_PREFIX = "team-gallery/uploads"
const MAX_TEAM_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export type ManagedTeamImage = {
  id: string
  url: string
  pathname: string
  description: string
  uploadedAt: string
}

type TeamImageManifest = {
  version: 1
  updatedAt: string
  images: ManagedTeamImage[]
}

type ManagedTeamImageState = {
  configured: boolean
  images: ManagedTeamImage[]
}

export function isTeamImageStorageConfigured(): boolean {
  return (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim().length > 0
}

function ensureBlobStorageConfigured(): void {
  if (isTeamImageStorageConfigured()) return
  throw new Error("BLOB_READ_WRITE_TOKEN が未設定です。Vercel Blob の読み書きトークンを設定してください。")
}

function normalizeManagedTeamImage(value: unknown): ManagedTeamImage | null {
  if (typeof value !== "object" || value === null) return null
  const candidate = value as Partial<ManagedTeamImage>
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.url !== "string" ||
    typeof candidate.pathname !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.uploadedAt !== "string"
  ) {
    return null
  }

  return {
    id: candidate.id,
    url: candidate.url,
    pathname: candidate.pathname,
    description: candidate.description,
    uploadedAt: candidate.uploadedAt,
  }
}

function buildManifest(images: ManagedTeamImage[]): TeamImageManifest {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    images,
  }
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()

  return cleaned.length > 0 ? cleaned : "team-image"
}

function fallbackDescriptionFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "")
  const humanized = base.replace(/[-_]+/g, " ").trim()
  return humanized.length > 0 ? humanized : "チーム紹介画像"
}

function buildDescriptions(files: File[], rawInput: string): string[] {
  const lines = rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return files.map((file) => fallbackDescriptionFromFileName(file.name))
  }

  if (lines.length === 1) {
    return files.map(() => lines[0])
  }

  if (lines.length !== files.length) {
    throw new Error("説明文は1行で共通指定するか、アップロード枚数と同じ行数で入力してください。")
  }

  return lines
}

async function writeManifest(images: ManagedTeamImage[]): Promise<void> {
  ensureBlobStorageConfigured()

  await put(TEAM_IMAGE_MANIFEST_PATH, JSON.stringify(buildManifest(images), null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  })
}

export async function readManagedTeamImages(): Promise<ManagedTeamImageState> {
  if (!isTeamImageStorageConfigured()) {
    return { configured: false, images: [] }
  }

  try {
    const { blobs } = await list({ prefix: TEAM_IMAGE_MANIFEST_PATH, limit: 10 })
    const manifestBlob = blobs.find((blob) => blob.pathname === TEAM_IMAGE_MANIFEST_PATH)

    if (manifestBlob == null) {
      return { configured: false, images: [] }
    }

    const response = await fetch(manifestBlob.url, { cache: "no-store" })
    if (!response.ok) {
      return { configured: false, images: [] }
    }

    const parsed = (await response.json()) as Partial<TeamImageManifest>
    const images = Array.isArray(parsed.images)
      ? parsed.images
          .map((value) => normalizeManagedTeamImage(value))
          .filter((value): value is ManagedTeamImage => value !== null)
      : []

    return { configured: true, images }
  } catch {
    return { configured: false, images: [] }
  }
}

export async function getPublicTeamGallery(): Promise<{
  photos: TeamGalleryPhoto[]
  usingFallbackGallery: boolean
}> {
  const state = await readManagedTeamImages()

  if (state.images.length > 0) {
    return {
      photos: state.images.map((image) => ({
        id: image.id,
        src: image.url,
        alt: image.description,
      })),
      usingFallbackGallery: false,
    }
  }

  if (!state.configured) {
    return {
      photos: DEFAULT_TEAM_GALLERY_PHOTOS,
      usingFallbackGallery: true,
    }
  }

  return {
    photos: [],
    usingFallbackGallery: false,
  }
}

export async function uploadManagedTeamImages(files: File[], rawDescriptions: string): Promise<number> {
  ensureBlobStorageConfigured()

  if (files.length === 0) {
    throw new Error("アップロードする画像を1枚以上選択してください。")
  }

  const descriptions = buildDescriptions(files, rawDescriptions)
  const state = await readManagedTeamImages()
  const uploadedImages: ManagedTeamImage[] = []

  try {
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith("image/")) {
        throw new Error("画像ファイルのみアップロードできます。")
      }

      if (file.size > MAX_TEAM_IMAGE_SIZE_BYTES) {
        throw new Error("1枚あたり10MB以下の画像を選択してください。")
      }

      const blob = await put(
        `${TEAM_IMAGE_UPLOAD_PREFIX}/${Date.now()}-${sanitizeFileName(file.name)}`,
        file,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type,
        },
      )

      uploadedImages.push({
        id: randomUUID(),
        url: blob.url,
        pathname: blob.pathname,
        description: descriptions[index],
        uploadedAt: new Date().toISOString(),
      })
    }

    await writeManifest([...uploadedImages.reverse(), ...state.images])
    return uploadedImages.length
  } catch (error) {
    if (uploadedImages.length > 0) {
      await Promise.allSettled(uploadedImages.map((image) => del(image.url)))
    }
    throw error
  }
}

export async function deleteManagedTeamImage(imageId: string): Promise<void> {
  ensureBlobStorageConfigured()

  const state = await readManagedTeamImages()
  const target = state.images.find((image) => image.id === imageId)

  if (target == null) {
    throw new Error("削除対象の画像が見つかりませんでした。")
  }

  await del(target.url)
  await writeManifest(state.images.filter((image) => image.id !== imageId))
}
