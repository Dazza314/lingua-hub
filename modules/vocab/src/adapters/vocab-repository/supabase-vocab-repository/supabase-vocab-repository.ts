import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VocabRepository } from '../../../ports/vocab-repository'
import { createDeleteImportedVocabItems } from './delete-items'
import { createGetImportedVocabItems } from './get-items'
import { createUpsertImportedVocabItems } from './upsert-vocab-items'

type VocabRepositoryFactories = {
  [Key in keyof VocabRepository as `create${Capitalize<Key>}`]: (
    client: SupabaseClient<Database>,
  ) => VocabRepository[Key]
}

export const supabaseVocabRepositoryFactories = {
  createGetImportedVocabItems,
  createUpsertImportedVocabItems,
  createDeleteImportedVocabItems,
} satisfies VocabRepositoryFactories
