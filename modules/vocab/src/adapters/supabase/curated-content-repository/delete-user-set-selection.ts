import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createDeleteUserSetSelection(
  client: SupabaseClient<Database>,
): CuratedContentRepository['deleteUserSetSelection'] {
  return async ({ userId, setId }) => {
    const { error } = await client
      .from('user_selected_sets')
      .delete()
      .eq('user_id', userId)
      .eq('set_id', setId)

    if (error) {
      throw new Error('Failed to deselect set', { cause: error })
    }
  }
}
