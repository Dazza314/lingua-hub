import { Language } from '@lingua-hub/core'
import { z } from 'zod'
import { availableLayoutIdSchema } from './available-layout-id'

export const vocabSourceLayoutSchema = z.object({
  id: availableLayoutIdSchema,
  language: Language.languageSchema,
  name: z.string(),
  fields: z.array(z.string()),
  termField: z.string(),
})

export type VocabSourceLayout = z.infer<typeof vocabSourceLayoutSchema>
