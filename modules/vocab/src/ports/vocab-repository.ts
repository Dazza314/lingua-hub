import type { Result } from '@praha/byethrow'
import type { Models } from '@lingua-hub/user'
import type { VocabItemNotFoundError, UnexpectedVocabRepositoryError } from '../errors'
import type { VocabId } from '../models/vocab-id'
import type { VocabItem } from '../models/vocab-item'

type UserId = Models.UserId.UserId

export type VocabRepository = {
  saveItems(userId: UserId, items: VocabItem[]): Result.ResultAsync<void, UnexpectedVocabRepositoryError>
  getItems(userId: UserId): Result.ResultAsync<VocabItem[], UnexpectedVocabRepositoryError>
  deleteItems(userId: UserId, ids: VocabId[]): Result.ResultAsync<
    void,
    VocabItemNotFoundError | UnexpectedVocabRepositoryError
  >
}
