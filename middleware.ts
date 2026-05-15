import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // staff / admin / api / _next / 静的ファイルはロケールルーティング対象外
  matcher: ["/((?!staff|admin|api|_next|.*\\..*).*)"],
}
