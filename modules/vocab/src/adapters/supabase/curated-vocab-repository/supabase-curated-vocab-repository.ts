import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CuratedVocabRepository } from '../../../ports/curated-vocab-repository'
import { createGetCuratedVocabItems } from './get-items'

type CuratedVocabRepositoryFactories = {
  [Key in keyof CuratedVocabRepository as `create${Capitalize<Key>}`]: (
    client: SupabaseClient<Database>,
  ) => CuratedVocabRepository[Key]
}

export const supabaseCuratedVocabRepositoryFactories = {
  createGetCuratedVocabItems,
} satisfies CuratedVocabRepositoryFactories
