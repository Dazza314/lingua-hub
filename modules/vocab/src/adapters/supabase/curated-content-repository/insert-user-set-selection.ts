import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createInsertUserSetSelection(
  client: SupabaseClient<Database>,
): CuratedContentRepository['insertUserSetSelection'] {
  return async ({ userId, setId }) => {
    const { error } = await client
      .from('user_selected_sets')
      .upsert(
        { user_id: userId, set_id: setId },
        { onConflict: 'user_id,set_id', ignoreDuplicates: true },
      )

    if (error) {
      throw new Error('Failed to select set', { cause: error })
    }
  }
}
