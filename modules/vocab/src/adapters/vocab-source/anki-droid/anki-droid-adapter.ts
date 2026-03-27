import { Result } from '@praha/byethrow'
import {
  UnexpectedVocabSourceError,
} from '../../../errors'
import type {
  InvalidLayoutError,
  VocabSourceUnavailableError,
} from '../../../errors'
import type { AvailableLayout } from '../../../models/available-layout'
import type { VocabItem } from '../../../models/vocab-item'
import type { VocabSourceLayout } from '../../../models/vocab-source-layout'
import type { VocabSource } from '../../../ports/vocab-source'

export class AnkiDroidAdapter implements VocabSource {
  getAvailableLayouts(): Result.ResultAsync<
    AvailableLayout[],
    VocabSourceUnavailableError | UnexpectedVocabSourceError
  > {
    return Promise.resolve(Result.fail(new UnexpectedVocabSourceError('Not implemented')))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getVocabItems(_layout: VocabSourceLayout): Result.ResultAsync<
    VocabItem[],
    VocabSourceUnavailableError | InvalidLayoutError | UnexpectedVocabSourceError
  > {
    return Promise.resolve(Result.fail(new UnexpectedVocabSourceError('Not implemented')))
  }
}
