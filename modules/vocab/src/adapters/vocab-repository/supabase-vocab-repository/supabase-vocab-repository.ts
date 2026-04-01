import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VocabRepository } from '../../../ports/vocab-repository'
import { createDeleteVocabItems } from './delete-items'
import { createGetVocabItems } from './get-items'
import { createUpsertVocabItems } from './upsert-vocab-items'

type VocabRepositoryFactories = {
  [Key in keyof VocabRepository as `create${Capitalize<Key>}`]: (
    client: SupabaseClient<Database>,
  ) => VocabRepository[Key]
}

export const supabaseVocabRepositoryFactories = {
  createGetVocabItems,
  createUpsertVocabItems,
  createDeleteVocabItems,
} satisfies VocabRepositoryFactories
