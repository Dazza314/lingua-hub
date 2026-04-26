import { z } from 'zod'
import { deckIdSchema } from './deck-id'

export const deckSchema = z.object({
  id: deckIdSchema,
  name: z.string(),
})

export type Deck = z.infer<typeof deckSchema>
