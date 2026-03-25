import { z } from 'zod'
import { RawNoteWithCardsSchema } from './RawNoteWithCards'

/** Generic paginated result wrapper for bridge responses. */
export const RawPaginatedResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
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

export const RawNotesPageSchema = RawPaginatedResultSchema(
  RawNoteWithCardsSchema,
)
export type RawNotesPage = z.infer<typeof RawNotesPageSchema>
