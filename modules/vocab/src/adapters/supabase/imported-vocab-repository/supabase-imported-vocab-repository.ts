import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ImportedVocabRepository } from '../../../ports/imported-vocab-repository'
import { createDeleteImportedVocabItems } from './delete-items'
import { createGetImportedVocabItems } from './get-items'
import { createUpsertImportedVocabItems } from './upsert-vocab-items'

type ImportedVocabRepositoryFactories = {
  [Key in keyof ImportedVocabRepository as `create${Capitalize<Key>}`]: (
    client: SupabaseClient<Database>,
  ) => ImportedVocabRepository[Key]
}

export const supabaseImportedVocabRepositoryFactories = {
  createGetImportedVocabItems,
  createUpsertImportedVocabItems,
  createDeleteImportedVocabItems,
} satisfies ImportedVocabRepositoryFactories
