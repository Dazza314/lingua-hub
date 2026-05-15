import type { Language, UserId } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type { ImportedVocabItemNotFoundError } from '../errors'
import type { VocabId } from '../models/vocab-id'
import type { ImportedVocabItem } from '../models/imported-vocab-item'

export type VocabRepository = {
  upsertImportedVocabItems(
    userId: UserId.UserId,
    items: ImportedVocabItem[],
  ): Promise<void>
  getImportedVocabItems(params: {
    userId: UserId.UserId
    language: Language.Language
  }): Promise<ImportedVocabItem[]>
  deleteImportedVocabItems(
    userId: UserId.UserId,
    ids: VocabId[],
  ): Result.ResultAsync<void, ImportedVocabItemNotFoundError>
}
