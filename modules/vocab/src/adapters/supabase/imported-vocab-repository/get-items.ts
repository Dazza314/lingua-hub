import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as ImportedVocabItem from '../../../models/imported-vocab-item'
import type { ImportedVocabRepository } from '../../../ports/imported-vocab-repository'

export function createGetImportedVocabItems(
  client: SupabaseClient<Database>,
): ImportedVocabRepository['getImportedVocabItems'] {
  return async ({ userId, language }) => {
    const { data, error } = await client
      .from('imported_vocab_items')
      .select('id, language, term')
      .eq('user_id', userId)
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch vocab items', { cause: error })
    }

    return (data ?? []).map((row) =>
      ImportedVocabItem.dangerouslyCast({
        id: row.id,
        language: row.language,
        term: row.term,
      }),
    )
  }
}
