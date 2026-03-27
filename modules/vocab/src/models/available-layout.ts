import { z } from 'zod'
import { availableLayoutIdSchema } from './available-layout-id'

export const availableLayoutSchema = z.object({
  id: availableLayoutIdSchema,
  name: z.string(),
  fields: z.array(z.string()),
  sampleValues: z.record(z.string(), z.string()),
})

export type AvailableLayout = z.infer<typeof availableLayoutSchema>
