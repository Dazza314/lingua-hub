import { z } from 'zod'
import { RawCardSchema } from './RawCard.js'
import { RawNoteSchema } from './RawNote.js'

/**
 * A note bundled with all its generated cards, as returned by the bridge.
 * Kotlin joins these in a single operation to avoid multiple bridge round-trips.
 */
export const RawNoteWithCardsSchema = z
  .object({
    note: RawNoteSchema,
    cards: z
      .array(RawCardSchema)
      .describe('All cards generated from this note, ordered by ordinal'),
  })
  .describe('Raw note with cards from AnkiDroid ContentProvider')
export type RawNoteWithCards = z.infer<typeof RawNoteWithCardsSchema>
