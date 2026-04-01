import { z } from 'zod'
import { makeParseUnknown } from '@lingua-hub/core'

const cardSchema = z
  .object({
    id: z.string().describe('Anki database ID for this card'),
    noteId: z
      .string()
      .describe('ID of the parent note that generated this card'),
    ordinal: z
      .number()
      .int()
      .describe('Which card template generated this card (0-indexed)'),
    cardName: z
      .string()
      .describe('Name of the card template, e.g. "Card 1" or "Recognition"'),
    deckId: z
      .string()
      .describe('ID of the deck this card currently belongs to'),
    questionSimple: z
      .string()
      .describe('Plain-text question with card styling stripped (no HTML/CSS)'),
    answerSimple: z
      .string()
      .describe('Plain-text answer with card styling stripped (no HTML/CSS)'),
  })
  .describe('Card from AnkiDroid ContentProvider')

const noteSchema = z
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
  .describe('Note from AnkiDroid ContentProvider')

export const noteWithCardsSchema = z
  .object({
    note: noteSchema,
    cards: z
      .array(cardSchema)
      .describe('All cards generated from this note, ordered by ordinal'),
  })
  .describe('Note with cards from AnkiDroid ContentProvider')

export type NoteWithCards = z.infer<typeof noteWithCardsSchema>
export const parse = makeParseUnknown(noteWithCardsSchema)
