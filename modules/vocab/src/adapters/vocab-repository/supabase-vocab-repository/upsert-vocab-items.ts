import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VocabRepository } from '../../../ports/vocab-repository'

export function createUpsertImportedVocabItems(
  client: SupabaseClient<Database>,
): VocabRepository['upsertImportedVocabItems'] {
  return async (userId, items) => {
    const rows = items.map((item) => ({
      id: item.id,
      user_id: userId,
      language: item.language,
      term: item.term,
      source: 'anki' as const,
    }))

    const { error } = await client
      .from('imported_vocab_items')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      throw new Error('Failed to upsert vocab items', { cause: error })
    }
  }
}
