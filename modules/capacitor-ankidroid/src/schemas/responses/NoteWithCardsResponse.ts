import { z } from 'zod'
import { makeParse } from '../../utils/makeParse'
import { NoteWithCardsSchema } from '../shared/NoteWithCards'

export const NoteWithCardsResponseSchema = z.object({
  note: NoteWithCardsSchema,
})
export type NoteWithCardsResponse = z.infer<typeof NoteWithCardsResponseSchema>
export const parse = makeParse(NoteWithCardsResponseSchema)
