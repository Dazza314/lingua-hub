import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { importedVocabIdSchema } from './imported-vocab-id'

export const importedVocabItemSchema = z.object({
  id: importedVocabIdSchema,
  language: Language.languageSchema,
  term: z.string(),
})

export type ImportedVocabItem = z.infer<typeof importedVocabItemSchema>

export const parse = makeParse(importedVocabItemSchema)

export const dangerouslyCast = (
  value: z.input<typeof importedVocabItemSchema>,
): ImportedVocabItem => value as ImportedVocabItem
