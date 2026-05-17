import { Language } from '@lingua-hub/core'
import { z } from 'zod'

export const exerciseSchema = z.object({
  language: Language.languageSchema,
  contextTag: z.string(),
  sentence: z.string(),
})

export type Exercise = z.infer<typeof exerciseSchema>
