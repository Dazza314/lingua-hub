import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'
import { noteWithCardsSchema } from '../shared/note-with-cards'

export const noteWithCardsResponseSchema = z.object({
  note: noteWithCardsSchema,
})
export type NoteWithCardsResponse = z.infer<typeof noteWithCardsResponseSchema>
export const parse = makeParse(noteWithCardsResponseSchema)
