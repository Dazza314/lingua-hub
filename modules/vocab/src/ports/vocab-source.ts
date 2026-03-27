import type { Result } from '@praha/byethrow'
import type {
  InvalidLayoutError,
  UnexpectedVocabSourceError,
  VocabSourceUnavailableError,
} from '../errors'
import type { AvailableLayout } from '../models/available-layout'
import type { VocabItem } from '../models/vocab-item'
import type { VocabSourceLayout } from '../models/vocab-source-layout'

export type VocabSource = {
  getAvailableLayouts(): Result.ResultAsync<
    AvailableLayout[],
    VocabSourceUnavailableError | UnexpectedVocabSourceError
  >
  getVocabItems(layout: VocabSourceLayout): Result.ResultAsync<
    VocabItem[],
    VocabSourceUnavailableError | InvalidLayoutError | UnexpectedVocabSourceError
  >
}
