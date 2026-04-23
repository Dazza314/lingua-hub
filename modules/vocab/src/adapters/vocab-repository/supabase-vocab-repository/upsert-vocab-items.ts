import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VocabRepository } from '../../../ports/vocab-repository'

export function createUpsertVocabItems(
  client: SupabaseClient<Database>,
): VocabRepository['upsertVocabItems'] {
  return async (userId, items) => {
    const rows = items.map((item) => ({
      id: item.id,
      user_id: userId,
      language: item.language,
      term: item.term,
      definition: item.definition,
      reading: item.reading ?? null,
    }))

    const { error } = await client
      .from('vocab_items')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      throw new Error('Failed to upsert vocab items', { cause: error })
    }
  }
}
