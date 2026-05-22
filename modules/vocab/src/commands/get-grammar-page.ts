import type { Page } from '@lingua-hub/core'
import type { CuratedGrammarPoint, CuratedSetId } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetGrammarPageDeps = {
  findGrammarPointsBySetId: CuratedContentRepository['findGrammarPointsBySetId']
}

export function makeGetGrammarPage(deps: GetGrammarPageDeps) {
  return (params: {
    id: CuratedSetId.CuratedSetId
    page: number
    pageSize: number
  }): Promise<Page<CuratedGrammarPoint.CuratedGrammarPoint>> => {
    return deps.findGrammarPointsBySetId(params)
  }
}
