import { isValid, parseISO } from "date-fns"
import type { RefinementCtx } from "zod"
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

const newsBodyBase = z.object({
  accessCode: z.string().min(1).max(NEWS_ACCESS_CODE_MAX),
  title: z.string().trim().min(1).max(NEWS_TITLE_MAX),
  startDate: z
    .string()
    .trim()
    .regex(isoDateRegex, "開始日は YYYY-MM-DD で指定してください。")
    .refine(isValidEventEndDateIso, "無効な開始日です。"),
  endDate: z.string().trim().optional(),
  content: z.string().max(NEWS_CONTENT_MAX).optional(),
  venue: z.string().max(NEWS_VENUE_MAX).optional(),
})

function resolveNewsEndDate<T extends { startDate: string; endDate?: string | undefined }>(data: T) {
  const rawEnd = (data.endDate ?? "").trim()
  const endDate = rawEnd !== "" ? rawEnd : data.startDate
  return { ...data, endDate }
}

function refineNewsEndDateRange(data: { startDate: string; endDate: string }, ctx: RefinementCtx) {
  if (!isoDateRegex.test(data.endDate) || !isValidEventEndDateIso(data.endDate)) {
    ctx.addIssue({
      code: "custom",
      message: "終了日は YYYY-MM-DD で指定するか、空にして1日のみにしてください。",
      path: ["endDate"],
    })
    return
  }
  if (data.endDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "終了日は開始日以降にしてください。",
      path: ["endDate"],
    })
  }
}

export const newsPostBodySchema = newsBodyBase.transform(resolveNewsEndDate).superRefine(refineNewsEndDateRange)

export const newsPatchBodySchema = newsBodyBase
  .extend({
    id: z.string().trim().min(1).max(200),
  })
  .transform(resolveNewsEndDate)
  .superRefine(refineNewsEndDateRange)

export const newsDeleteBodySchema = z.object({
  accessCode: z.string().min(1).max(NEWS_ACCESS_CODE_MAX),
  id: z.string().trim().min(1).max(200),
})

export type NewsPostBody = z.output<typeof newsPostBodySchema>
export type NewsPatchBody = z.output<typeof newsPatchBodySchema>
export type NewsDeleteBody = z.infer<typeof newsDeleteBodySchema>
