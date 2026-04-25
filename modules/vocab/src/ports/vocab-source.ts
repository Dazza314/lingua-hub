import type { Result } from '@praha/byethrow'
import type { InvalidLayoutError, VocabSourceUnavailableError } from '../errors'
import type { AvailableLayout } from '../models/available-layout'
import type { VocabItem } from '../models/vocab-item'
import type { VocabSourceLayout } from '../models/vocab-source-layout'

type VocabItemsPage = {
  items: VocabItem[]
  totalCount: number
  hasMore: boolean
}

export type VocabSource = {
  getAvailableLayouts(): Result.ResultAsync<
    AvailableLayout[],
    VocabSourceUnavailableError
  >
  getVocabItems(
    layout: VocabSourceLayout,
    pagination: { limit: number; offset: number },
  ): Result.ResultAsync<
    VocabItemsPage,
    VocabSourceUnavailableError | InvalidLayoutError
  >
}
