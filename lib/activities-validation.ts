import { isValid, parseISO } from "date-fns"
import { z } from "zod"

export const ACTIVITIES_TITLE_MAX = 200
export const ACTIVITIES_LOCATION_MAX = 200
export const ACTIVITIES_CONTENT_MAX = 8000
export const ACTIVITIES_OPPONENT_MAX = 200
export const ACTIVITIES_ACCESS_CODE_MAX = 256
export const ACTIVITIES_JSON_BODY_MAX_BYTES = 96_000
export const ACTIVITIES_MAX_ITEMS = 500

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

export function isValidActivityDateIso(value: string): boolean {
  if (!isoDateRegex.test(value)) return false
  return isValid(parseISO(value))
}

export const activityPostBodySchema = z.object({
  accessCode: z.string().min(1).max(ACTIVITIES_ACCESS_CODE_MAX),
  date: z
    .string()
    .trim()
    .regex(isoDateRegex, "日付は YYYY-MM-DD で指定してください。")
    .refine(isValidActivityDateIso, "無効な日付です。"),
  title: z.string().trim().min(1).max(ACTIVITIES_TITLE_MAX),
  location: z.string().trim().max(ACTIVITIES_LOCATION_MAX).optional().default(""),
  content: z.string().max(ACTIVITIES_CONTENT_MAX).optional(),
  opponent: z.string().trim().min(1).max(ACTIVITIES_OPPONENT_MAX),
})

export const activityDeleteBodySchema = z.object({
  accessCode: z.string().min(1).max(ACTIVITIES_ACCESS_CODE_MAX),
  id: z.string().trim().min(1).max(200),
})

export type ActivityPostBody = z.infer<typeof activityPostBodySchema>
export type ActivityDeleteBody = z.infer<typeof activityDeleteBodySchema>
