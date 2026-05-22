import type { Result } from '@praha/byethrow'
import type { CuratedSetNotFoundError } from '../errors'
import type { CuratedSet, CuratedSetId } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetSetByIdDeps = {
  findSetById: CuratedContentRepository['findSetById']
}

export function makeGetSetById(deps: GetSetByIdDeps) {
  return (params: {
    id: CuratedSetId.CuratedSetId
  }): Result.ResultAsync<CuratedSet.CuratedSet, CuratedSetNotFoundError> => {
    return deps.findSetById(params)
  }
}
