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
  hiddenDefaultImageIds?: string[]
}

export type ManagedTeamImageState = {
  storageReady: boolean
  hasManagedImages: boolean
  images: ManagedTeamImage[]
  hiddenDefaultImageIds: string[]
  visibleDefaultPhotos: TeamGalleryPhoto[]
}

export function isTeamImageStorageConfigured(): boolean {
  return (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim().length > 0
}

function getBlobReadWriteToken(): string {
  const token = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()
  if (token.length > 0) return token
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

function normalizeHiddenDefaultImageIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const validIds = new Set(DEFAULT_TEAM_GALLERY_PHOTOS.map((photo) => photo.id))
  return value
    .filter((item): item is string => typeof item === "string" && validIds.has(item))
    .filter((item, index, list) => list.indexOf(item) === index)
}

function visibleDefaultPhotosFromHiddenIds(hiddenDefaultImageIds: string[]): TeamGalleryPhoto[] {
  const hiddenSet = new Set(hiddenDefaultImageIds)
  return DEFAULT_TEAM_GALLERY_PHOTOS.filter((photo) => !hiddenSet.has(photo.id))
}

function buildManifest(
  images: ManagedTeamImage[],
  hiddenDefaultImageIds: string[] = [],
): TeamImageManifest {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    images,
    hiddenDefaultImageIds,
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

async function writeManifest(
  images: ManagedTeamImage[],
  hiddenDefaultImageIds: string[] = [],
): Promise<void> {
  const token = getBlobReadWriteToken()

  await put(TEAM_IMAGE_MANIFEST_PATH, JSON.stringify(buildManifest(images, hiddenDefaultImageIds), null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    token,
  })
}

export async function readManagedTeamImages(): Promise<ManagedTeamImageState> {
  if (!isTeamImageStorageConfigured()) {
    return {
      storageReady: false,
      hasManagedImages: false,
      images: [],
      hiddenDefaultImageIds: [],
      visibleDefaultPhotos: DEFAULT_TEAM_GALLERY_PHOTOS,
    }
  }

  try {
    const { blobs } = await list({
      prefix: TEAM_IMAGE_MANIFEST_PATH,
      limit: 10,
      token: getBlobReadWriteToken(),
    })
    const manifestBlob = blobs.find((blob) => blob.pathname === TEAM_IMAGE_MANIFEST_PATH)

    if (manifestBlob == null) {
      return {
        storageReady: true,
        hasManagedImages: false,
        images: [],
        hiddenDefaultImageIds: [],
        visibleDefaultPhotos: DEFAULT_TEAM_GALLERY_PHOTOS,
      }
    }

    const response = await fetch(manifestBlob.url, { cache: "no-store" })
    if (!response.ok) {
      return {
        storageReady: true,
        hasManagedImages: false,
        images: [],
        hiddenDefaultImageIds: [],
        visibleDefaultPhotos: DEFAULT_TEAM_GALLERY_PHOTOS,
      }
    }

    const parsed = (await response.json()) as Partial<TeamImageManifest>
    const images = Array.isArray(parsed.images)
      ? parsed.images
          .map((value) => normalizeManagedTeamImage(value))
          .filter((value): value is ManagedTeamImage => value !== null)
      : []
    const hiddenDefaultImageIds = normalizeHiddenDefaultImageIds(parsed.hiddenDefaultImageIds)

    return {
      storageReady: true,
      hasManagedImages: images.length > 0,
      images,
      hiddenDefaultImageIds,
      visibleDefaultPhotos: visibleDefaultPhotosFromHiddenIds(hiddenDefaultImageIds),
    }
  } catch {
    return {
      storageReady: true,
      hasManagedImages: false,
      images: [],
      hiddenDefaultImageIds: [],
      visibleDefaultPhotos: DEFAULT_TEAM_GALLERY_PHOTOS,
    }
  }
}

export async function getPublicTeamGallery(): Promise<{
  photos: TeamGalleryPhoto[]
  usingFallbackGallery: boolean
}> {
  const state = await readManagedTeamImages()

  if (state.hasManagedImages) {
    return {
      photos: state.images.map((image) => ({
        id: image.id,
        src: image.url,
        alt: image.description,
      })),
      usingFallbackGallery: false,
    }
  }

  return {
    photos: state.visibleDefaultPhotos,
    usingFallbackGallery: state.visibleDefaultPhotos.length > 0,
  }
}

export async function uploadManagedTeamImages(files: File[], rawDescriptions: string): Promise<number> {
  const token = getBlobReadWriteToken()

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
          token,
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

    await writeManifest([...uploadedImages.reverse(), ...state.images], state.hiddenDefaultImageIds)
    return uploadedImages.length
  } catch (error) {
    if (uploadedImages.length > 0) {
      await Promise.allSettled(uploadedImages.map((image) => del(image.url, { token })))
    }
    throw error
  }
}

export async function updateManagedTeamImageDescription(
  imageId: string,
  rawDescription: string,
): Promise<void> {
  const description = rawDescription.trim()
  if (description.length === 0) {
    throw new Error("画像説明を入力してください。")
  }

  const state = await readManagedTeamImages()
  const target = state.images.find((image) => image.id === imageId)

  if (target == null) {
    throw new Error("更新対象の画像が見つかりませんでした。")
  }

  await writeManifest(
    state.images.map((image) =>
      image.id === imageId
        ? {
            ...image,
            description,
          }
        : image,
    ),
    state.hiddenDefaultImageIds,
  )
}

export async function deleteManagedTeamImage(imageId: string): Promise<void> {
  const token = getBlobReadWriteToken()

  const state = await readManagedTeamImages()
  if (imageId.startsWith("default:")) {
    const defaultImageId = imageId.slice("default:".length)
    const targetDefault = state.visibleDefaultPhotos.find((photo) => photo.id === defaultImageId)

    if (targetDefault == null) {
      throw new Error("削除対象の初期画像が見つかりませんでした。")
    }

    await writeManifest(state.images, [...state.hiddenDefaultImageIds, defaultImageId])
    return
  }

  const target = state.images.find((image) => image.id === imageId)

  if (target == null) {
    throw new Error("削除対象の画像が見つかりませんでした。")
  }

  await del(target.url, { token })
  await writeManifest(
    state.images.filter((image) => image.id !== imageId),
    state.hiddenDefaultImageIds,
  )
}
