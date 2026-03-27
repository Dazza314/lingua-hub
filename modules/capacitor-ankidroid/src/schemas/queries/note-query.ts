import { z } from 'zod'

export const NoteQuerySchema = z
  .object({
    deckId: z
      .string()
      .optional()
      .describe('Filter to notes whose cards belong to this deck'),
    modelId: z
      .string()
      .optional()
      .describe('Filter to notes using this note type'),
    modifiedSince: z
      .number()
      .int()
      .optional()
      .describe(
        'Unix epoch seconds — only return notes modified after this time',
      ),
    searchQuery: z
      .string()
      .optional()
      .describe('Anki browser search syntax, e.g. "tag:verb"'),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Max notes to return. Defaults to 500.'),
    offset: z
      .number()
      .int()
      .optional()
      .describe('Number of notes to skip for pagination'),
  })
  .describe('Query options for getNotesWithCards')

export type NoteQuery = z.infer<typeof NoteQuerySchema>
