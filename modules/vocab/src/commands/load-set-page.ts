import type { Page } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import type { CuratedSetNotFoundError } from '../errors'
import type {
  CuratedGrammarPoint,
  CuratedSet,
  CuratedSetId,
  CuratedVocabItem,
} from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type LoadSetPageDeps = {
  findSetById: CuratedContentRepository['findSetById']
  findVocabItemsBySetId: CuratedContentRepository['findVocabItemsBySetId']
  findGrammarPointsBySetId: CuratedContentRepository['findGrammarPointsBySetId']
}

export type SetPageData = {
  set: CuratedSet.CuratedSet
  vocabPage: Page<CuratedVocabItem.CuratedVocabItem>
  grammarPage: Page<CuratedGrammarPoint.CuratedGrammarPoint>
}

export function makeLoadSetPage({
  findSetById,
  findVocabItemsBySetId,
  findGrammarPointsBySetId,
}: LoadSetPageDeps) {
  return async (params: {
    id: CuratedSetId.CuratedSetId
    pageSize: number
  }): Result.ResultAsync<SetPageData, CuratedSetNotFoundError> => {
    const [setResult, vocabPage, grammarPage] = await Promise.all([
      findSetById({ id: params.id }),
      findVocabItemsBySetId({
        id: params.id,
        page: 1,
        pageSize: params.pageSize,
      }),
      findGrammarPointsBySetId({
        id: params.id,
        page: 1,
        pageSize: params.pageSize,
      }),
    ])
    if (Result.isFailure(setResult)) {
      return setResult
    }
    return Result.succeed({ set: setResult.value, vocabPage, grammarPage })
  }
}
