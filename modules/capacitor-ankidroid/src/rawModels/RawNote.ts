import { z } from 'zod'

/**
 * Raw note as returned by the AnkiDroid ContentProvider bridge.
 * A note is the core knowledge unit — it stores content and generates cards.
 */
export const RawNoteSchema = z
  .object({
    id: z.string().describe('Anki database ID for this note'),
    guid: z
      .string()
      .describe('Globally unique ID — stable across imports/exports'),
    modelId: z
      .string()
      .describe("ID of the note type that defines this note's fields"),
    modifiedTimestamp: z
      .number()
      .int()
      .describe('Unix epoch seconds when this note was last modified'),
    tags: z
      .array(z.string())
      .describe("User-applied tags, e.g. ['verb', 'N5']"),
    fields: z
      .record(z.string(), z.string())
      .describe(
        'Field name → field value map. ' +
          'Kotlin joins with the model to produce named fields instead of raw \\x1f-separated string.',
      ),
    sortField: z
      .string()
      .describe(
        'Value of the sort field — the primary field used for ordering',
      ),
  })
  .describe('Raw note from AnkiDroid ContentProvider')

export type RawNote = z.infer<typeof RawNoteSchema>
