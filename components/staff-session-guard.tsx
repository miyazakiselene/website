"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isStaffSessionUnlocked, repairStaffSessionIfIncomplete } from "@/lib/staff-session"

type StaffSessionGuardProps = {
  children: React.ReactNode
}

export function StaffSessionGuard({ children }: StaffSessionGuardProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    repairStaffSessionIfIncomplete()
    if (isStaffSessionUnlocked()) {
      setReady(true)
      return
    }
    router.replace("/staff")
  }, [router])

  if (!ready) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">確認しています…</p>
    )
  }

  return <>{children}</>
}
