import { createFindSetWithItemsById } from './find-set-with-items-by-id'
import { createFindSetsByLanguage } from './find-sets-by-language'
import { createGetCuratedGrammarPoints } from './get-grammar-points'
import { createGetCuratedVocabItems } from './get-vocab-items'

export const supabaseCuratedContentRepositoryFactories = {
  createGetCuratedVocabItems,
  createGetCuratedGrammarPoints,
  createFindSetsByLanguage,
  createFindSetWithItemsById,
}
