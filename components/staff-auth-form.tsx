"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setStaffSessionUnlocked } from "@/lib/staff-session"

type StaffAuthFormProps = {
  onUnlocked: () => void
}

export function StaffAuthForm({ onUnlocked }: StaffAuthFormProps) {
  const [codeInput, setCodeInput] = useState("")
  const [authError, setAuthError] = useState("")
  const expectedCode = process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "123456"

  const unlock = () => {
    if (codeInput.trim() === expectedCode) {
      setStaffSessionUnlocked()
      setAuthError("")
      onUnlocked()
      return
    }
    setAuthError("アクセスコードが違います。")
  }

  return (
    <Card className="max-w-lg mx-auto border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Lock className="h-6 w-6 text-primary" />
          関係者認証
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          このページはチーム関係者向けです。アクセスコードを入力してください。
        </p>
        <div className="space-y-2">
          <Label htmlFor="staff-code">アクセスコード</Label>
          <Input
            id="staff-code"
            type="password"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="アクセスコードを入力"
            onKeyDown={(e) => {
              if (e.key === "Enter") unlock()
            }}
          />
        </div>
        {authError !== "" ? <p className="text-sm text-red-400">{authError}</p> : null}
        <Button className="w-full" onClick={unlock}>
          認証して入室
        </Button>
        <p className="text-xs text-muted-foreground">
          ※ 本番では `.env` の `NEXT_PUBLIC_STAFF_ACCESS_CODE` を必ず変更してください。
        </p>
      </CardContent>
    </Card>
  )
}
