import type { Language, Page } from '@lingua-hub/core'
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

  findSetById(params: {
    id: CuratedSetId
  }): Result.ResultAsync<CuratedSet, CuratedSetNotFoundError>

  findSetWithItemsById(params: {
    id: CuratedSetId
  }): Result.ResultAsync<CuratedSetWithItems, CuratedSetNotFoundError>

  findVocabItemsBySetId(params: {
    id: CuratedSetId
    page: number
    pageSize: number
  }): Promise<Page<CuratedVocabItem>>

  findGrammarPointsBySetId(params: {
    id: CuratedSetId
    page: number
    pageSize: number
  }): Promise<Page<CuratedGrammarPoint>>
}
