import { z } from 'zod'
import { makeParse } from '../../utils/makeParse'

export const CountNotesResponseSchema = z.object({
  count: z.number().int(),
})
export type CountNotesResponse = z.infer<typeof CountNotesResponseSchema>
export const parse = makeParse(CountNotesResponseSchema)
