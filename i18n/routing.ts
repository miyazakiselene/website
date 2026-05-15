import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["ja", "en"],
  defaultLocale: "ja",
  // デフォルトロケール（ja）は URL プレフィックスなし → / のまま
  // 英語は /en/ になる
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]

// next-intl の型付きナビゲーションヘルパー（useRouter, usePathname, Link）
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
