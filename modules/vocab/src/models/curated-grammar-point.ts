import { Language, makeParse } from '@lingua-hub/core'
import { z } from 'zod'
import { curatedGrammarPointIdSchema } from './curated-grammar-point-id'

export const curatedGrammarPointSchema = z.object({
  id: curatedGrammarPointIdSchema,
  language: Language.languageSchema,
  title: z.string(),
  explanation: z.string(),
})

export type CuratedGrammarPoint = z.infer<typeof curatedGrammarPointSchema>

export const parse = makeParse(curatedGrammarPointSchema)

export const dangerouslyCast = (
  value: z.input<typeof curatedGrammarPointSchema>,
): CuratedGrammarPoint => value as CuratedGrammarPoint
