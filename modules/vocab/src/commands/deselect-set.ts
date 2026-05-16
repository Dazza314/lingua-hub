import type { UserId } from '@lingua-hub/core'
import type { CuratedSetId } from '../models/curated-set-id'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type DeselectSetDeps = {
  deleteUserSetSelection: CuratedContentRepository['deleteUserSetSelection']
}

export function deselectSet(deps: DeselectSetDeps) {
  return async (params: {
    userId: UserId.UserId
    setId: CuratedSetId
  }): Promise<void> => {
    await deps.deleteUserSetSelection(params)
  }
}
