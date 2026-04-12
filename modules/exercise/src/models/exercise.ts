import { z } from 'zod'
import { scenarioFrameSchema } from './scenario-frame'

export const exerciseSchema = z.object({
  sentence: z.string(),
  scenarioFrame: scenarioFrameSchema,
})

export type Exercise = z.infer<typeof exerciseSchema>
