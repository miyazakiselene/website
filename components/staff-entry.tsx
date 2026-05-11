"use client"

import { useEffect, useState } from "react"
import { isStaffSessionUnlocked } from "@/lib/staff-session"
import { StaffAuthForm } from "@/components/staff-auth-form"
import { StaffHub } from "@/components/staff-hub"

export function StaffEntry() {
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    setUnlocked(isStaffSessionUnlocked())
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">読み込み中…</p>
    )
  }

  if (!unlocked) {
    return <StaffAuthForm onUnlocked={() => setUnlocked(true)} />
  }

  return <StaffHub />
}
