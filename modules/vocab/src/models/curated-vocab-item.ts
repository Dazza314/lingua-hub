import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { curatedVocabIdSchema } from './curated-vocab-id'

export const curatedVocabItemSchema = z.object({
  id: curatedVocabIdSchema,
  language: Language.languageSchema,
  term: z.string(),
})

export type CuratedVocabItem = z.infer<typeof curatedVocabItemSchema>

export const parse = makeParse(curatedVocabItemSchema)

export const dangerouslyCast = (
  value: z.input<typeof curatedVocabItemSchema>,
): CuratedVocabItem => value as CuratedVocabItem
