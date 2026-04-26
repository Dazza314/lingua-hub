import { z } from 'zod'

export const deckIdSchema = z.string().brand('DeckId')
export type DeckId = z.infer<typeof deckIdSchema>
