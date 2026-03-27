import { z } from 'zod'
import { makeParse } from '../../utils/makeParse'

export const AddNoteResponseSchema = z.object({
  noteId: z.string(),
})
export type AddNoteResponse = z.infer<typeof AddNoteResponseSchema>
export const parse = makeParse(AddNoteResponseSchema)
