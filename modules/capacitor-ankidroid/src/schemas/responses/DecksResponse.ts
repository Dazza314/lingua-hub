import { z } from 'zod'
import { makeParse } from '../../utils/makeParse'

const DeckSchema = z
  .object({
    id: z.string().describe('Anki database ID for this deck'),
    name: z
      .string()
      .describe(
        'Full deck name including parent path, e.g. "Japanese::Core 2000". Use "::" to split into segments.',
      ),
    description: z
      .string()
      .describe('User-written deck description shown on the overview screen'),
    counts: z
      .object({
        learn: z
          .number()
          .int()
          .describe(
            'Cards currently in the learning phase (new cards being drilled)',
          ),
        review: z
          .number()
          .int()
          .describe('Cards due for spaced-repetition review today'),
        new: z.number().int().describe('Cards not yet seen for the first time'),
      })
      .describe("Today's due counts"),
    isDynamic: z
      .boolean()
      .describe(
        'True if this is a filtered/dynamic deck (auto-generated from a search query)',
      ),
  })
  .describe('Deck from AnkiDroid ContentProvider')

export const DecksResponseSchema = z.object({
  decks: z.array(DeckSchema),
})
export type DecksResponse = z.infer<typeof DecksResponseSchema>
export const parse = makeParse(DecksResponseSchema)
