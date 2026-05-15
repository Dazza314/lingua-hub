import { z } from 'zod'

export const curatedGrammarPointIdSchema = z
  .uuid()
  .brand('CuratedGrammarPointId')
export type CuratedGrammarPointId = z.infer<typeof curatedGrammarPointIdSchema>
