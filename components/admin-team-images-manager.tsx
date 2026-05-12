"use client"

import Image from "next/image"
import { useFormStatus } from "react-dom"
import {
  AlertTriangle,
  ImagePlus,
  Image as ImageIcon,
  Images,
  LogOut,
  Save,
  Trash2,
  Upload,
} from "lucide-react"
import {
  deleteTeamImageAction,
  logoutAdminAction,
  uploadTeamImagesAction,
  updateTeamImageDescriptionAction,
} from "@/app/admin/team-images/actions"
import type { ManagedTeamImage } from "@/lib/team-images"
import type { TeamGalleryPhoto } from "@/lib/team-gallery-defaults"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AdminTeamImagesManagerProps = {
  images: ManagedTeamImage[]
  message?: string
  error?: string
  storageReady: boolean
  showingDefaultGallery: boolean
  showingManagedGallery: boolean
  fallbackImages: TeamGalleryPhoto[]
}

function FormSubmitButton({
  children,
  pendingLabel,
  variant,
  disabled,
  size,
}: {
  children: React.ReactNode
  pendingLabel: string
  variant?: "default" | "outline" | "secondary" | "destructive"
  disabled?: boolean
  size?: "default" | "sm" | "lg" | "icon"
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} size={size} disabled={disabled || pending}>
      {pending ? pendingLabel : children}
    </Button>
  )
}

function DeleteImageDialog({
  imageId,
  description,
}: {
  imageId: string
  description: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm" className="w-full">
          <Trash2 className="h-4 w-4" />
          削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>この画像を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            公開中の画像一覧から外れます。元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
          {description}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <form action={deleteTeamImageAction}>
            <input type="hidden" name="imageId" value={imageId} />
            <AlertDialogAction asChild>
              <button type="submit">削除する</button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AdminTeamImagesManager({
  images,
  message,
  error,
  storageReady,
  showingDefaultGallery,
  showingManagedGallery,
  fallbackImages,
}: AdminTeamImagesManagerProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground md:text-4xl">チーム紹介画像管理</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            チーム紹介セクションの画像をアップロード・削除できます。複数枚の同時登録にも対応しています。
          </p>
        </div>
        <form action={logoutAdminAction}>
          <FormSubmitButton pendingLabel="ログアウト中…" variant="outline">
            <LogOut className="h-4 w-4" />
            ログアウト
          </FormSubmitButton>
        </form>
      </div>

      {message ? (
        <Alert>
          <Images />
          <AlertTitle>操作が完了しました</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!storageReady ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Blob の設定が未完了です</AlertTitle>
          <AlertDescription>
            `BLOB_READ_WRITE_TOKEN` が未設定のため、アップロードと削除はまだ使えません。環境変数を設定するとこの画面から管理できます。
          </AlertDescription>
        </Alert>
      ) : null}

      {showingDefaultGallery ? (
        <Alert>
          <ImagePlus />
          <AlertTitle>初期画像は公開のまま残ります</AlertTitle>
          <AlertDescription>
            新しくアップロードした画像は、初期画像に追加される形で公開ページへ反映されます。不要な初期画像だけ個別に削除できます。
          </AlertDescription>
        </Alert>
      ) : null}

      {showingManagedGallery ? (
        <Alert>
          <ImageIcon />
          <AlertTitle>追加画像も公開中です</AlertTitle>
          <AlertDescription>
            公開ページのチーム紹介セクションでは、初期画像に加えてアップロード済みの画像も表示しています。
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-primary" />
            画像をアップロード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadTeamImagesAction} className="space-y-5" encType="multipart/form-data">
            <div className="space-y-2">
              <Label htmlFor="team-images-upload">画像ファイル</Label>
              <Input
                id="team-images-upload"
                name="images"
                type="file"
                accept="image/*"
                multiple
                required
                disabled={!storageReady}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                JPG / PNG / WebP などの画像を複数枚まとめて選択できます。1枚あたり10MB以下でアップロードしてください。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-images-descriptions">画像説明</Label>
              <Textarea
                id="team-images-descriptions"
                name="descriptions"
                rows={4}
                placeholder={"1行なら全画像に同じ説明を設定\n複数行なら画像枚数分を上から順に設定"}
                disabled={!storageReady}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                未入力の場合はファイル名をもとに説明文を自動作成します。複数枚の個別説明は改行区切りで入力してください。
              </p>
            </div>

            <FormSubmitButton pendingLabel="アップロード中…" disabled={!storageReady}>
              <Upload className="h-4 w-4" />
              画像をアップロード
            </FormSubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Images className="h-5 w-5 text-primary" />
            現在の管理画像
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length > 0 || fallbackImages.length > 0 ? (
            <div className="space-y-8">
              {fallbackImages.length > 0 ? (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">初期画像</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      元から表示している画像です。追加画像をアップロードしても残り続けます。
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {fallbackImages.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-muted/40">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-3 p-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{image.alt}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              現在公開中の初期画像です
                            </p>
                          </div>
                          <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                            不要な場合のみ削除してください。削除しない限り、追加画像と一緒に公開されます。
                          </div>
                          <DeleteImageDialog
                            imageId={`default:${image.id}`}
                            description={image.alt}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {images.length > 0 ? (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">追加画像</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      アップロードした画像です。初期画像に追加される形で公開ページに並びます。
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-muted/40">
                          <Image
                            src={image.url}
                            alt={image.description}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-4 p-4">
                          <div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(image.uploadedAt).toLocaleString("ja-JP")}
                            </p>
                          </div>
                          <form action={updateTeamImageDescriptionAction} className="space-y-2">
                            <input type="hidden" name="imageId" value={image.id} />
                            <Label htmlFor={`team-image-description-${image.id}`}>画像説明</Label>
                            <Input
                              id={`team-image-description-${image.id}`}
                              name="description"
                              defaultValue={image.description}
                              maxLength={120}
                            />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              公開ページの画像説明として使われます。
                            </p>
                            <FormSubmitButton pendingLabel="保存中…" variant="secondary" size="sm">
                              <Save className="h-4 w-4" />
                              説明を保存
                            </FormSubmitButton>
                          </form>
                          <DeleteImageDialog imageId={image.id} description={image.description} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
              <p className="text-base font-semibold text-foreground">まだ管理画像はありません</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                初期画像に加えて、ここへ追加画像が並び、公開ページのチーム紹介セクションにも反映されます。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
