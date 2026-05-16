import { createDeleteUserSetSelection } from './delete-user-set-selection'
import { createFindSelectedSetsByUserId } from './find-selected-sets-by-user-id'
import { createFindSetWithItemsById } from './find-set-with-items-by-id'
import { createFindSetsByLanguage } from './find-sets-by-language'
import { createGetCuratedGrammarPoints } from './get-grammar-points'
import { createGetCuratedVocabItems } from './get-vocab-items'
import { createInsertUserSetSelection } from './insert-user-set-selection'

export const supabaseCuratedContentRepositoryFactories = {
  createGetCuratedVocabItems,
  createGetCuratedGrammarPoints,
  createFindSetsByLanguage,
  createFindSetWithItemsById,
  createFindSelectedSetsByUserId,
  createInsertUserSetSelection,
  createDeleteUserSetSelection,
}
