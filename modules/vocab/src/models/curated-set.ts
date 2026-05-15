import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { curatedSetIdSchema } from './curated-set-id'

export const curatedSetSchema = z.object({
  id: curatedSetIdSchema,
  language: Language.languageSchema,
  title: z.string(),
})

export type CuratedSet = z.infer<typeof curatedSetSchema>

export const parse = makeParse(curatedSetSchema)

export const dangerouslyCast = (
  value: z.input<typeof curatedSetSchema>,
): CuratedSet => value as CuratedSet
