import { z } from 'zod'
import { availableLayoutIdSchema } from './available-layout-id'
import { vocabFieldMappingSchema } from './vocab-field-mapping'

export const vocabSourceLayoutSchema = z.object({
  id: availableLayoutIdSchema,
  name: z.string(),
  fields: z.array(z.string()),
  mappings: z.array(vocabFieldMappingSchema),
})

export type VocabSourceLayout = z.infer<typeof vocabSourceLayoutSchema>
