import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CuratedGrammarPointRepository } from '../../../ports/curated-grammar-point-repository'
import { createGetCuratedGrammarPoints } from './get-items'

type CuratedGrammarPointRepositoryFactories = {
  [Key in keyof CuratedGrammarPointRepository as `create${Capitalize<Key>}`]: (
    client: SupabaseClient<Database>,
  ) => CuratedGrammarPointRepository[Key]
}

export const supabaseCuratedGrammarPointRepositoryFactories = {
  createGetCuratedGrammarPoints,
} satisfies CuratedGrammarPointRepositoryFactories
