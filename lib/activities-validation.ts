import { isValid, parseISO } from "date-fns"
import { z } from "zod"

export const ACTIVITIES_TITLE_MAX = 200
export const ACTIVITIES_LOCATION_MAX = 200
export const ACTIVITIES_CONTENT_MAX = 8000
/** 対戦相手1行あたり（1チーム）の最大文字数 */
export const ACTIVITIES_OPPONENT_LINE_MAX = 120
/** 対戦相手の最大行数（チーム数） */
export const ACTIVITIES_OPPONENT_MAX_LINES = 40
/** 対戦相手フィールド全体（改行区切り複数チーム）の最大文字数 */
export const ACTIVITIES_OPPONENT_MAX = 2400
export const ACTIVITIES_ACCESS_CODE_MAX = 256
export const ACTIVITIES_JSON_BODY_MAX_BYTES = 96_000
export const ACTIVITIES_MAX_ITEMS = 500

/** 関係者ページ「登録済み」で修正・削除を出す直近件数 */
export const ACTIVITIES_STAFF_RECENT_MANAGE_COUNT = 6

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

export function isValidActivityDateIso(value: string): boolean {
  if (!isoDateRegex.test(value)) return false
  return isValid(parseISO(value))
}

export const activityPostBodySchema = z
  .object({
    accessCode: z.string().min(1).max(ACTIVITIES_ACCESS_CODE_MAX),
    startDate: z
      .string()
      .trim()
      .regex(isoDateRegex, "開始日は YYYY-MM-DD で指定してください。")
      .refine(isValidActivityDateIso, "無効な開始日です。"),
    endDate: z.string().trim().optional(),
    title: z.string().trim().min(1).max(ACTIVITIES_TITLE_MAX),
    location: z.string().trim().max(ACTIVITIES_LOCATION_MAX).optional().default(""),
    content: z.string().max(ACTIVITIES_CONTENT_MAX).optional(),
    opponent: z.string().trim().min(1).max(ACTIVITIES_OPPONENT_MAX),
  })
  .transform((data) => {
    const rawEnd = (data.endDate ?? "").trim()
    const endDate = rawEnd !== "" ? rawEnd : data.startDate
    return { ...data, endDate }
  })
  .superRefine((data, ctx) => {
    if (!isoDateRegex.test(data.endDate) || !isValidActivityDateIso(data.endDate)) {
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
  })

export const activityPatchBodySchema = z
  .object({
    accessCode: z.string().min(1).max(ACTIVITIES_ACCESS_CODE_MAX),
    id: z.string().trim().min(1).max(200),
    startDate: z
      .string()
      .trim()
      .regex(isoDateRegex, "開始日は YYYY-MM-DD で指定してください。")
      .refine(isValidActivityDateIso, "無効な開始日です。"),
    endDate: z.string().trim().optional(),
    title: z.string().trim().min(1).max(ACTIVITIES_TITLE_MAX),
    location: z.string().trim().max(ACTIVITIES_LOCATION_MAX).optional().default(""),
    content: z.string().max(ACTIVITIES_CONTENT_MAX).optional(),
    opponent: z.string().trim().min(1).max(ACTIVITIES_OPPONENT_MAX),
  })
  .transform((data) => {
    const rawEnd = (data.endDate ?? "").trim()
    const endDate = rawEnd !== "" ? rawEnd : data.startDate
    return { ...data, endDate }
  })
  .superRefine((data, ctx) => {
    if (!isoDateRegex.test(data.endDate) || !isValidActivityDateIso(data.endDate)) {
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
  })

export const activityDeleteBodySchema = z.object({
  accessCode: z.string().min(1).max(ACTIVITIES_ACCESS_CODE_MAX),
  id: z.string().trim().min(1).max(200),
})

export type ActivityPostBody = z.output<typeof activityPostBodySchema>
export type ActivityPatchBody = z.output<typeof activityPatchBodySchema>
export type ActivityDeleteBody = z.infer<typeof activityDeleteBodySchema>
