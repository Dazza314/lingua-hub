import { z } from 'zod'
import { makeParseUnknown } from '@lingua-hub/core'

export const countNotesResponseSchema = z.object({
  count: z.number().int(),
})
export type CountNotesResponse = z.infer<typeof countNotesResponseSchema>
export const parse = makeParseUnknown(countNotesResponseSchema)
