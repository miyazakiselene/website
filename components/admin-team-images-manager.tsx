"use client"

import Image from "next/image"
import { useFormStatus } from "react-dom"
import {
  AlertTriangle,
  ImagePlus,
  Image as ImageIcon,
  Images,
  LogOut,
  Trash2,
  Upload,
} from "lucide-react"
import {
  deleteTeamImageAction,
  logoutAdminAction,
  uploadTeamImagesAction,
} from "@/app/admin/team-images/actions"
import type { ManagedTeamImage } from "@/lib/team-images"
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
  usingFallbackGallery: boolean
  showingManagedGallery: boolean
}

function FormSubmitButton({
  children,
  pendingLabel,
  variant,
  disabled,
}: {
  children: React.ReactNode
  pendingLabel: string
  variant?: "default" | "outline" | "secondary" | "destructive"
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} disabled={disabled || pending}>
      {pending ? pendingLabel : children}
    </Button>
  )
}

function DeleteImageDialog({ image }: { image: ManagedTeamImage }) {
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
            削除すると Vercel Blob と管理データの両方から消えます。元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
          {image.description}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <form action={deleteTeamImageAction}>
            <input type="hidden" name="imageId" value={image.id} />
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
  usingFallbackGallery,
  showingManagedGallery,
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

      {usingFallbackGallery ? (
        <Alert>
          <ImagePlus />
          <AlertTitle>現在は既存の初期画像を公開表示中です</AlertTitle>
          <AlertDescription>
            最初のアップロードを行うと、チーム紹介セクションは管理画像へ切り替わります。
          </AlertDescription>
        </Alert>
      ) : null}

      {showingManagedGallery ? (
        <Alert>
          <ImageIcon />
          <AlertTitle>現在は管理画像を表示中です</AlertTitle>
          <AlertDescription>
            公開ページのチーム紹介セクションでは、アップロード済みの管理画像を表示しています。
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
          {images.length > 0 ? (
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
                      <p className="text-sm font-semibold text-foreground">{image.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(image.uploadedAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                    <DeleteImageDialog image={image} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
              <p className="text-base font-semibold text-foreground">まだ管理画像はありません</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                初回アップロード後、この一覧に画像が並び、公開ページのチーム紹介セクションにも反映されます。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
