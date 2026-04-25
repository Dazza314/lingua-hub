import type { UserId } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import type { InvalidLayoutError, VocabSourceUnavailableError } from '../errors'
import type { VocabSourceLayout } from '../models/vocab-source-layout'
import type { VocabRepository } from '../ports/vocab-repository'
import type { VocabSource } from '../ports/vocab-source'

type ImportVocabDeps = {
  getVocabItems: VocabSource['getVocabItems']
  upsertVocabItems: VocabRepository['upsertVocabItems']
}

type ImportVocabInput = {
  userId: UserId.UserId
  layout: VocabSourceLayout
}

export function importVocab({
  getVocabItems,
  upsertVocabItems,
}: ImportVocabDeps) {
  return async ({
    userId,
    layout,
  }: ImportVocabInput): Result.ResultAsync<
    { count: number },
    VocabSourceUnavailableError | InvalidLayoutError
  > => {
    const PAGE_SIZE = 500
    let offset = 0
    let done = 0

    while (true) {
      const page = await getVocabItems(layout, { limit: PAGE_SIZE, offset })

      if (Result.isFailure(page)) {
        return page
      }

      await upsertVocabItems(userId, page.value.items)
      done += page.value.items.length

      if (!page.value.hasMore) {
        break
      }
      offset += PAGE_SIZE
    }

    return Result.succeed({ count: done })
  }
}
