import { isValid, parseISO } from "date-fns"
import { z } from "zod"

export const NEWS_TITLE_MAX = 200
export const NEWS_VENUE_MAX = 200
export const NEWS_CONTENT_MAX = 8000
export const NEWS_ACCESS_CODE_MAX = 256
export const NEWS_JSON_BODY_MAX_BYTES = 96_000
export const NEWS_MAX_ITEMS = 300

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

export function isValidEventEndDateIso(value: string): boolean {
  if (!isoDateRegex.test(value)) return false
  const d = parseISO(value)
  return isValid(d)
}

export const newsPostBodySchema = z.object({
  accessCode: z.string().min(1).max(NEWS_ACCESS_CODE_MAX),
  title: z.string().trim().min(1).max(NEWS_TITLE_MAX),
  date: z
    .string()
    .trim()
    .regex(isoDateRegex, "日付は YYYY-MM-DD で指定してください。")
    .refine(isValidEventEndDateIso, "無効な日付です。"),
  content: z.string().max(NEWS_CONTENT_MAX).optional(),
  venue: z.string().max(NEWS_VENUE_MAX).optional(),
})

export type NewsPostBody = z.infer<typeof newsPostBodySchema>
