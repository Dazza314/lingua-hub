import type { UserId } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type {
  UnexpectedVocabRepositoryError,
  VocabItemNotFoundError,
} from '../errors'
import type { VocabId } from '../models/vocab-id'
import type { VocabItem } from '../models/vocab-item'

export type VocabRepository = {
  saveItems(
    userId: UserId.UserId,
    items: VocabItem[],
  ): Result.ResultAsync<void, UnexpectedVocabRepositoryError>
  getItems(
    userId: UserId.UserId,
  ): Result.ResultAsync<VocabItem[], UnexpectedVocabRepositoryError>
  deleteItems(
    userId: UserId.UserId,
    ids: VocabId[],
  ): Result.ResultAsync<
    void,
    VocabItemNotFoundError | UnexpectedVocabRepositoryError
  >
}
