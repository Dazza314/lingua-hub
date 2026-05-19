import type { Page } from '@lingua-hub/core'
import type { CuratedGrammarPoint, CuratedSetId } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetSetGrammarPageDeps = {
  findGrammarPointsBySetId: CuratedContentRepository['findGrammarPointsBySetId']
}

export function getSetGrammarPage(deps: GetSetGrammarPageDeps) {
  return (params: {
    id: CuratedSetId.CuratedSetId
    page: number
    pageSize: number
  }): Promise<Page<CuratedGrammarPoint.CuratedGrammarPoint>> => {
    return deps.findGrammarPointsBySetId(params)
  }
}
