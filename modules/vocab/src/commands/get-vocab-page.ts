import type { Page } from '@lingua-hub/core'
import type { CuratedSetId, CuratedVocabItem } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetVocabPageDeps = {
  findVocabItemsBySetId: CuratedContentRepository['findVocabItemsBySetId']
}

export function getVocabPage(deps: GetVocabPageDeps) {
  return (params: {
    id: CuratedSetId.CuratedSetId
    page: number
    pageSize: number
  }): Promise<Page<CuratedVocabItem.CuratedVocabItem>> => {
    return deps.findVocabItemsBySetId(params)
  }
}
