import { createGetCuratedGrammarPoints } from './get-grammar-points'
import { createGetCuratedVocabItems } from './get-vocab-items'

export const supabaseCuratedContentRepositoryFactories = {
  createGetCuratedVocabItems,
  createGetCuratedGrammarPoints,
}
