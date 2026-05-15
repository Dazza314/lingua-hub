import type { Language, UserId } from '@lingua-hub/core'
import type { Result } from '@praha/byethrow'
import type { ImportedVocabItemNotFoundError } from '../errors'
import type { ImportedVocabId } from '../models/imported-vocab-id'
import type { ImportedVocabItem } from '../models/imported-vocab-item'

export type ImportedVocabRepository = {
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
    ids: ImportedVocabId[],
  ): Result.ResultAsync<void, ImportedVocabItemNotFoundError>
}
