import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const ADMIN_SESSION_COOKIE_NAME = "selene-admin-session"
const ADMIN_SESSION_SALT = "selene-admin-v1"
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12

function getExpectedAdminAccessCode(): string {
  return process.env.ADMIN_ACCESS_CODE ?? process.env.NEXT_PUBLIC_STAFF_ACCESS_CODE ?? "123456"
}

function buildSessionToken(code: string): string {
  return createHash("sha256").update(`${ADMIN_SESSION_SALT}:${code}`).digest("hex")
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function adminAccessCodeMatches(input: string): boolean {
  const expected = getExpectedAdminAccessCode().trim()
  const candidate = input.trim()

  if (expected.length === 0 || candidate.length === 0) return false
  return safeCompare(buildSessionToken(candidate), buildSessionToken(expected))
}

export async function isAdminSessionAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const currentToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value

  if (currentToken == null || currentToken.length === 0) return false
  return safeCompare(currentToken, buildSessionToken(getExpectedAdminAccessCode().trim()))
}

export async function startAdminSession(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: buildSessionToken(getExpectedAdminAccessCode().trim()),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
}

export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  })
}
