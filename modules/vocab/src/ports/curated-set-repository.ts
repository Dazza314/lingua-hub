import type { Language } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type { CuratedSetNotFoundError } from '../errors'
import type { CuratedSet } from '../models/curated-set'
import type { CuratedSetId } from '../models/curated-set-id'
import type { CuratedSetWithItems } from '../models/curated-set-with-items'

export type CuratedSetRepository = {
  findByLanguage(params: { language: Language.Language }): Promise<CuratedSet[]>

  findWithItemsById(params: {
    id: CuratedSetId
  }): Result.ResultAsync<CuratedSetWithItems, CuratedSetNotFoundError>
}
