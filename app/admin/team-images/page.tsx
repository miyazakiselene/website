import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { authenticateAdminAction } from "@/app/admin/team-images/actions"
import { AdminTeamImagesManager } from "@/components/admin-team-images-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAdminSessionAuthenticated } from "@/lib/admin-session"
import { readManagedTeamImages } from "@/lib/team-images"

export const metadata: Metadata = {
  title: "画像管理 | 宮崎 SELENE",
  description: "チーム紹介セクションで使う画像の管理画面です。",
  robots: {
    index: false,
    follow: false,
  },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminTeamImagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const message = pickFirst(params.message)
  const error = pickFirst(params.error)
  const authenticated = await isAdminSessionAuthenticated()
  const managedImagesState = authenticated ? await readManagedTeamImages() : null

  return (
    <div className="space-y-8">
      <Link
        href="/staff"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        関係者専用ページに戻る
      </Link>

      {!authenticated ? (
        <>
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-foreground md:text-4xl">管理者ログイン</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              チーム紹介セクションの画像を管理するには、管理者アクセスコードでログインしてください。
            </p>
          </header>

          {message ? (
            <Alert>
              <Lock />
              <AlertTitle>お知らせ</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <Lock />
              <AlertTitle>ログインできませんでした</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="max-w-xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="h-6 w-6 text-primary" />
                管理者認証
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={authenticateAdminAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-access-code">アクセスコード</Label>
                  <Input
                    id="admin-access-code"
                    name="accessCode"
                    type="password"
                    placeholder="管理者アクセスコードを入力"
                    required
                  />
                </div>
                <Button type="submit">ログイン</Button>
              </form>
            </CardContent>
          </Card>
        </>
      ) : (
        <AdminTeamImagesManager
          images={managedImagesState?.images ?? []}
          message={message}
          error={error}
          storageReady={managedImagesState?.storageReady ?? false}
          usingFallbackGallery={(managedImagesState?.storageReady ?? false) && !(managedImagesState?.hasManagedImages ?? false)}
          showingManagedGallery={managedImagesState?.hasManagedImages ?? false}
        />
      )}
    </div>
  )
}
