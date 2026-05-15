import type { Language } from '@lingua-hub/core'
import type { CuratedGrammarPoint } from '../models/curated-grammar-point'

export type CuratedGrammarPointRepository = {
  getCuratedGrammarPoints(params: {
    language: Language.Language
  }): Promise<CuratedGrammarPoint[]>
}
