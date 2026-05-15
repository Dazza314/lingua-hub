import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { vocabIdSchema } from './vocab-id'

export const importedVocabItemSchema = z.object({
  id: vocabIdSchema,
  language: Language.languageSchema,
  term: z.string(),
})

export type ImportedVocabItem = z.infer<typeof importedVocabItemSchema>

export const parse = makeParse(importedVocabItemSchema)

export const dangerouslyCast = (
  value: z.input<typeof importedVocabItemSchema>,
): ImportedVocabItem => value as ImportedVocabItem
