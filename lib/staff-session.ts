/** 関係者ページの認証状態（同一ブラウザ・タブセッション内） */
export const STAFF_SESSION_STORAGE_KEY = "selene-staff-unlocked"

/** お知らせAPIなどへの送信に使うアクセスコード（認証成功時のみ保持） */
const STAFF_API_ACCESS_CODE_KEY = "selene-staff-api-access-code"

export function isStaffSessionUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return window.sessionStorage.getItem(STAFF_SESSION_STORAGE_KEY) === "1"
}

export function setStaffSessionUnlocked(accessCode?: string): void {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STAFF_SESSION_STORAGE_KEY, "1")
  if (accessCode != null && accessCode.length > 0) {
    window.sessionStorage.setItem(STAFF_API_ACCESS_CODE_KEY, accessCode)
  }
}

export function getStaffApiAccessCode(): string | null {
  if (typeof window === "undefined") return null
  return window.sessionStorage.getItem(STAFF_API_ACCESS_CODE_KEY)
}

export function clearStaffSession(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(STAFF_SESSION_STORAGE_KEY)
  window.sessionStorage.removeItem(STAFF_API_ACCESS_CODE_KEY)
}
