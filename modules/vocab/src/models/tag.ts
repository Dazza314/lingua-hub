import { z } from 'zod'
import { tagIdSchema } from './tag-id'

export const tagSchema = z.object({
  id: tagIdSchema,
  name: z.string(),
})

export type Tag = z.infer<typeof tagSchema>
