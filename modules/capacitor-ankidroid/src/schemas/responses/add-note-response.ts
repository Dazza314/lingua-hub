import { z } from 'zod'
import { makeParseUnknown } from '@lingua-hub/core'

export const addNoteResponseSchema = z.object({
  noteId: z.string(),
})
export type AddNoteResponse = z.infer<typeof addNoteResponseSchema>
export const parse = makeParseUnknown(addNoteResponseSchema)
