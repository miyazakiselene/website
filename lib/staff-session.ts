/** 関係者ページの認証状態（同一ブラウザ・タブセッション内） */
export const STAFF_SESSION_STORAGE_KEY = "selene-staff-unlocked"

export function isStaffSessionUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return window.sessionStorage.getItem(STAFF_SESSION_STORAGE_KEY) === "1"
}

export function setStaffSessionUnlocked(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STAFF_SESSION_STORAGE_KEY, "1")
}

export function clearStaffSession(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(STAFF_SESSION_STORAGE_KEY)
}
