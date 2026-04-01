import { makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { vocabIdSchema } from './vocab-id'

export const vocabItemSchema = z.object({
  id: vocabIdSchema,
  term: z.string(),
  definition: z.string(),
  reading: z.string().optional(),
})

export type VocabItem = z.infer<typeof vocabItemSchema>

export const parse = makeParse(vocabItemSchema)
