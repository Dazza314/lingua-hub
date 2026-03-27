import { z } from 'zod'
import { vocabFieldTargetSchema } from './vocab-field-target'

export const vocabFieldMappingSchema = z.object({
  sourceField: z.string(),
  target: vocabFieldTargetSchema,
})

export type VocabFieldMapping = z.infer<typeof vocabFieldMappingSchema>
