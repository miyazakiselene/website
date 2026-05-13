"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/staff", label: "メニュー" },
  { href: "/staff/news", label: "お知らせ管理" },
  { href: "/staff/activities", label: "活動記録" },
  { href: "/staff/results", label: "試合結果" },
  { href: "/admin/team-images", label: "チーム紹介画像" },
  { href: "/staff/dashboard", label: "ダッシュボード" },
  { href: "/staff/update-log", label: "更新ログ" },
] as const

export function StaffAreaNav() {
  const pathname = usePathname()

  return (
    <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        トップページに戻る
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
        {links.map(({ href, label }) => {
          const active =
            href === "/staff"
              ? pathname === "/staff"
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
