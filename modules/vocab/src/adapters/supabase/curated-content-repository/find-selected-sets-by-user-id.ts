import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedSet from '../../../models/curated-set'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSelectedSetsByUserId(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSelectedSetsByUserId'] {
  return async ({ userId }) => {
    const { data, error } = await client
      .from('user_selected_sets')
      .select('sets(id, language, title)')
      .eq('user_id', userId as string)

    if (error) {
      throw new Error('Failed to fetch selected sets', { cause: error })
    }

    return data.map((row) => {
      const sets = row.sets
      return CuratedSet.dangerouslyCast({
        id: sets.id,
        language: sets.language,
        title: sets.title,
      })
    })
  }
}
