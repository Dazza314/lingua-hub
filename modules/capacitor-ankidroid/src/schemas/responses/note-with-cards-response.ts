import { z } from 'zod'
import { makeParseUnknown } from '@lingua-hub/core'
import { noteWithCardsSchema } from '../shared/note-with-cards'

export const noteWithCardsResponseSchema = z.object({
  note: noteWithCardsSchema,
})
export type NoteWithCardsResponse = z.infer<typeof noteWithCardsResponseSchema>
export const parse = makeParseUnknown(noteWithCardsResponseSchema)
