import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'

export const countNotesResponseSchema = z.object({
  count: z.number().int(),
})
export type CountNotesResponse = z.infer<typeof countNotesResponseSchema>
export const parse = makeParse(countNotesResponseSchema)
