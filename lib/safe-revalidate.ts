import { revalidatePath } from "next/cache"

/** Route Handler 内で revalidatePath が失敗しても保存処理を落とさない */
export function revalidatePathsSafe(paths: readonly string[]): void {
  for (const pathname of paths) {
    try {
      revalidatePath(pathname)
    } catch (error) {
      console.error(`[revalidatePath] ${pathname}`, error)
    }
  }
}
