import type { Language, UserId } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type { VocabItemNotFoundError } from '../errors'
import type { VocabId } from '../models/vocab-id'
import type { VocabItem } from '../models/vocab-item'

export type VocabRepository = {
  upsertVocabItems(userId: UserId.UserId, items: VocabItem[]): Promise<void>
  getVocabItems(params: {
    userId: UserId.UserId
    language: Language.Language
  }): Promise<VocabItem[]>
  deleteVocabItems(
    userId: UserId.UserId,
    ids: VocabId[],
  ): Result.ResultAsync<void, VocabItemNotFoundError>
}
