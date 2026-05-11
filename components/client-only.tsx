"use client"

import { useSyncExternalStore } from "react"

type ClientOnlyProps = {
  children: React.ReactNode
}

export function ClientOnly({ children }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!isClient) {
    return null
  }

  return <>{children}</>
}
