import { z } from 'zod'

export const addNoteOptionsSchema = z
  .object({
    modelId: z.string().describe('ID of the note type to use'),
    deckId: z
      .string()
      .describe('ID of the deck the generated cards will be placed in'),
    fields: z
      .record(z.string(), z.string())
      .describe("Field name → value map matching the note type's fieldNames"),
    tags: z
      .array(z.string())
      .optional()
      .describe('Optional tags to apply to the new note'),
  })
  .describe('Options for creating a new note via AnkiDroid bridge')

export type AddNoteOptions = z.infer<typeof addNoteOptionsSchema>
