import type { Result } from '@praha/byethrow'
import type { VocabItemNotFoundError, UnexpectedVocabRepositoryError } from '../errors'
import type { VocabId } from '../models/vocab-id'
import type { VocabItem } from '../models/vocab-item'

export type VocabRepository = {
  saveItems(items: VocabItem[]): Result.ResultAsync<void, UnexpectedVocabRepositoryError>
  getItems(): Result.ResultAsync<VocabItem[], UnexpectedVocabRepositoryError>
  deleteItems(ids: VocabId[]): Result.ResultAsync<
    void,
    VocabItemNotFoundError | UnexpectedVocabRepositoryError
  >
}
