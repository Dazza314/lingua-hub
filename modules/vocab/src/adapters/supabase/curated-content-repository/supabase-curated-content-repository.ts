import { createFindGrammarPointsBySetId } from './find-grammar-points-by-set-id'
import { createFindSetById } from './find-set-by-id'
import { createFindSetWithItemsById } from './find-set-with-items-by-id'
import { createFindSetsByLanguage } from './find-sets-by-language'
import { createFindVocabItemsBySetId } from './find-vocab-items-by-set-id'
import { createGetCuratedGrammarPoints } from './get-grammar-points'
import { createGetCuratedVocabItems } from './get-vocab-items'

export const supabaseCuratedContentRepositoryFactories = {
  createGetCuratedVocabItems,
  createGetCuratedGrammarPoints,
  createFindSetsByLanguage,
  createFindSetById,
  createFindSetWithItemsById,
  createFindVocabItemsBySetId,
  createFindGrammarPointsBySetId,
}
