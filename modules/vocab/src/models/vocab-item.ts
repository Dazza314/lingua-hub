import { z } from 'zod'
import { vocabIdSchema } from './vocab-id'
import { tagSchema } from './tag'

export const vocabItemSchema = z.object({
  id: vocabIdSchema,
  term: z.string(),
  definition: z.string(),
  reading: z.string().optional(),
  tags: z.array(tagSchema),
})

export type VocabItem = z.infer<typeof vocabItemSchema>
