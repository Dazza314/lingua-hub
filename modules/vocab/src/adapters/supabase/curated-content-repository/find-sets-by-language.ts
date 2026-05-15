import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedSet from '../../../models/curated-set'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindSetsByLanguage(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findSetsByLanguage'] {
  return async ({ language }) => {
    const { data, error } = await client
      .from('sets')
      .select('id, language, title')
      .eq('language', language)

    if (error) {
      throw new Error('Failed to fetch curated sets', { cause: error })
    }

    return (data ?? []).map((row) =>
      CuratedSet.dangerouslyCast({
        id: row.id,
        language: row.language,
        title: row.title,
      }),
    )
  }
}
