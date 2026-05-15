import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { curatedGrammarPointSchema } from './curated-grammar-point'
import { curatedSetIdSchema } from './curated-set-id'
import { curatedVocabItemSchema } from './curated-vocab-item'

export const curatedSetWithItemsSchema = z.object({
  id: curatedSetIdSchema,
  language: Language.languageSchema,
  title: z.string(),
  vocabItems: z.array(curatedVocabItemSchema),
  grammarPoints: z.array(curatedGrammarPointSchema),
})

export type CuratedSetWithItems = z.infer<typeof curatedSetWithItemsSchema>

export const parse = makeParse(curatedSetWithItemsSchema)

export const dangerouslyCast = (
  value: z.input<typeof curatedSetWithItemsSchema>,
): CuratedSetWithItems => value as CuratedSetWithItems
