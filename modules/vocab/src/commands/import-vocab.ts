import type { UserId } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import type { InvalidLayoutError, VocabSourceUnavailableError } from '../errors'
import type { VocabSourceLayout } from '../models/vocab-source-layout'
import type { VocabRepository } from '../ports/vocab-repository'
import type { VocabSource } from '../ports/vocab-source'

export type ImportVocabDeps = {
  getVocabItems: VocabSource['getVocabItems']
  upsertVocabItems: VocabRepository['upsertVocabItems']
}

export type ImportVocabInput = {
  userId: UserId.UserId
  layout: VocabSourceLayout
}

export function importVocab({ getVocabItems, upsertVocabItems }: ImportVocabDeps) {
  return async ({
    userId,
    layout,
  }: ImportVocabInput): Result.ResultAsync<
    void,
    VocabSourceUnavailableError | InvalidLayoutError
  > => {
    const result = await getVocabItems(layout)

    if (Result.isFailure(result)) {
      return result
    }

    await upsertVocabItems(userId, result.value)

    return Result.succeed(undefined)
  }
}
