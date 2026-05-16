import type { Language, UserId } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type { CuratedSetNotFoundError } from '../errors'
import type { CuratedGrammarPoint } from '../models/curated-grammar-point'
import type { CuratedSet } from '../models/curated-set'
import type { CuratedSetId } from '../models/curated-set-id'
import type { CuratedSetWithItems } from '../models/curated-set-with-items'
import type { CuratedVocabItem } from '../models/curated-vocab-item'

export type CuratedContentRepository = {
  getCuratedVocabItems(params: {
    language: Language.Language
  }): Promise<CuratedVocabItem[]>

  getCuratedGrammarPoints(params: {
    language: Language.Language
  }): Promise<CuratedGrammarPoint[]>

  findSetsByLanguage(params: {
    language: Language.Language
  }): Promise<CuratedSet[]>

  findSetWithItemsById(params: {
    id: CuratedSetId
  }): Result.ResultAsync<CuratedSetWithItems, CuratedSetNotFoundError>

  findSelectedSetsByUserId(params: {
    userId: UserId.UserId
  }): Promise<CuratedSet[]>
  insertUserSetSelection(params: {
    userId: UserId.UserId
    setId: CuratedSetId
  }): Promise<void>
  deleteUserSetSelection(params: {
    userId: UserId.UserId
    setId: CuratedSetId
  }): Promise<void>
}
