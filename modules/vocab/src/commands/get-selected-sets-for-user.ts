import type { UserId } from '@lingua-hub/core'
import type { CuratedSet } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetSelectedSetsForUserDeps = {
  findSelectedSetsByUserId: CuratedContentRepository['findSelectedSetsByUserId']
}

export function getSelectedSetsForUser(deps: GetSelectedSetsForUserDeps) {
  return async (params: {
    userId: UserId.UserId
  }): Promise<CuratedSet.CuratedSet[]> => {
    return deps.findSelectedSetsByUserId(params)
  }
}
