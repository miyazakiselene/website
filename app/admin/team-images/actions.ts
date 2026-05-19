"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  adminAccessCodeMatches,
  endAdminSession,
  isAdminSessionAuthenticated,
  startAdminSession,
} from "@/lib/admin-session"
import {
  deleteManagedTeamImage,
  uploadManagedTeamImages,
  updateManagedTeamImageDescription,
  reorderTeamGallery,
} from "@/lib/team-images"

function buildRedirectUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value.length === 0) continue
    searchParams.set(key, value)
  }

  const query = searchParams.toString()
  return query.length > 0 ? `/admin/team-images?${query}` : "/admin/team-images"
}

function redirectWithState(params: Record<string, string | undefined>): never {
  redirect(buildRedirectUrl(params))
}

export async function authenticateAdminAction(formData: FormData): Promise<void> {
  const accessCode = String(formData.get("accessCode") ?? "")

  if (!adminAccessCodeMatches(accessCode)) {
    redirectWithState({ error: "アクセスコードが違います。" })
  }

  await startAdminSession()
  redirectWithState({ message: "管理画面にログインしました。" })
}

export async function logoutAdminAction(): Promise<void> {
  await endAdminSession()
  redirectWithState({ message: "管理画面からログアウトしました。" })
}

export async function uploadTeamImagesAction(formData: FormData): Promise<void> {
  if (!(await isAdminSessionAuthenticated())) {
    redirectWithState({ error: "再度ログインしてください。" })
  }

  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
  const descriptions = String(formData.get("descriptions") ?? "")

  let uploadedCount: number

  try {
    uploadedCount = await uploadManagedTeamImages(images, descriptions)
  } catch (error) {
    const message = error instanceof Error ? error.message : "画像のアップロードに失敗しました。"
    redirectWithState({ error: message })
  }

  revalidatePath("/")
  revalidatePath("/admin/team-images")
  redirectWithState({ message: `${uploadedCount}枚の画像をアップロードしました。` })
}

export async function deleteTeamImageAction(formData: FormData): Promise<void> {
  if (!(await isAdminSessionAuthenticated())) {
    redirectWithState({ error: "再度ログインしてください。" })
  }

  const imageId = String(formData.get("imageId") ?? "").trim()
  if (imageId.length === 0) {
    redirectWithState({ error: "削除対象の画像IDが不正です。" })
  }

  try {
    await deleteManagedTeamImage(imageId)
  } catch (error) {
    const message = error instanceof Error ? error.message : "画像の削除に失敗しました。"
    redirectWithState({ error: message })
  }

  revalidatePath("/")
  revalidatePath("/admin/team-images")
  redirectWithState({ message: "画像を削除しました。" })
}

export async function reorderTeamGalleryAction(formData: FormData): Promise<void> {
  if (!(await isAdminSessionAuthenticated())) {
    redirectWithState({ error: "再度ログインしてください。" })
  }

  const orderJson = String(formData.get("photoOrder") ?? "")
  let order: string[]
  try {
    const parsed = JSON.parse(orderJson)
    if (!Array.isArray(parsed)) throw new Error("not an array")
    order = parsed
  } catch {
    redirectWithState({ error: "並び順のデータが不正です。" })
  }

  try {
    await reorderTeamGallery(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : "並び順の保存に失敗しました。"
    redirectWithState({ error: message })
  }

  revalidatePath("/")
  revalidatePath("/admin/team-images")
  redirectWithState({ message: "並び順を保存しました。" })
}

export async function updateTeamImageDescriptionAction(formData: FormData): Promise<void> {
  if (!(await isAdminSessionAuthenticated())) {
    redirectWithState({ error: "再度ログインしてください。" })
  }

  const imageId = String(formData.get("imageId") ?? "").trim()
  const description = String(formData.get("description") ?? "")

  if (imageId.length === 0) {
    redirectWithState({ error: "更新対象の画像IDが不正です。" })
  }

  try {
    await updateManagedTeamImageDescription(imageId, description)
  } catch (error) {
    const message = error instanceof Error ? error.message : "画像説明の更新に失敗しました。"
    redirectWithState({ error: message })
  }

  revalidatePath("/")
  revalidatePath("/admin/team-images")
  redirectWithState({ message: "画像説明を更新しました。" })
}
