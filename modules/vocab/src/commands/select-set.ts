import type { UserId } from '@lingua-hub/core'
import type { CuratedSetId } from '../models/curated-set-id'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type SelectSetDeps = {
  insertUserSetSelection: CuratedContentRepository['insertUserSetSelection']
}

export function selectSet(deps: SelectSetDeps) {
  return async (params: {
    userId: UserId.UserId
    setId: CuratedSetId
  }): Promise<void> => {
    await deps.insertUserSetSelection(params)
  }
}
