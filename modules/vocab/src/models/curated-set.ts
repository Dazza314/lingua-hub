import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { curatedSetIdSchema } from './curated-set-id'

export const curatedSetBaseSchema = z.object({
  id: curatedSetIdSchema,
  language: Language.languageSchema,
  title: z.string(),
  category: z.string(),
})

export const curatedSetSchema = curatedSetBaseSchema.extend({
  vocabCount: z.number().int().nonnegative(),
  grammarCount: z.number().int().nonnegative(),
})

export type CuratedSet = z.infer<typeof curatedSetSchema>

export const parse = makeParse(curatedSetSchema)

export const dangerouslyCast = (
  value: z.input<typeof curatedSetSchema>,
): CuratedSet => value as CuratedSet
