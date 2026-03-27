import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'
import { NoteWithCardsSchema } from '../shared/note-with-cards'

export const NoteWithCardsResponseSchema = z.object({
  note: NoteWithCardsSchema,
})
export type NoteWithCardsResponse = z.infer<typeof NoteWithCardsResponseSchema>
export const parse = makeParse(NoteWithCardsResponseSchema)
