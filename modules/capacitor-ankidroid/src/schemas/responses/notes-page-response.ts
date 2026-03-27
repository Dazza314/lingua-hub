import { z } from 'zod'
import { makeParse } from '../../utils/make-parse'
import { NoteWithCardsSchema } from '../shared/note-with-cards'

const makePaginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z
    .object({
      data: z.array(itemSchema),
      totalCount: z
        .number()
        .int()
        .describe('Total matching items across all pages'),
      hasMore: z
        .boolean()
        .describe('True if there are more items beyond this page'),
    })
    .describe('Paginated result from AnkiDroid bridge')

export const NotesPageResponseSchema =
  makePaginatedResultSchema(NoteWithCardsSchema)

export type NotesPageResponse = z.infer<typeof NotesPageResponseSchema>
export const parse = makeParse(NotesPageResponseSchema)
