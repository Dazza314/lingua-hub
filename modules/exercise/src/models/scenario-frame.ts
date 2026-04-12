import { makeParse } from '@lingua-hub/core'
import { z } from 'zod'

export const scenarioFrameSchema = z.object({
  setting: z.string(),
  situation: z.string(),
})

export type ScenarioFrame = z.infer<typeof scenarioFrameSchema>

export const parse = makeParse(scenarioFrameSchema)
