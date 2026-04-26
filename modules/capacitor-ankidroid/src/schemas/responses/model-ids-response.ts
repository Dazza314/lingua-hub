import { z } from 'zod'
import { makeParseUnknown } from '@lingua-hub/core'

export const modelIdsResponseSchema = z.object({
  modelIds: z.array(z.string()),
})
export type ModelIdsResponse = z.infer<typeof modelIdsResponseSchema>
export const parse = makeParseUnknown(modelIdsResponseSchema)
