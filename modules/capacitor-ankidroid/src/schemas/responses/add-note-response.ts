import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'

export const addNoteResponseSchema = z.object({
  noteId: z.string(),
})
export type AddNoteResponse = z.infer<typeof addNoteResponseSchema>
export const parse = makeParse(addNoteResponseSchema)
