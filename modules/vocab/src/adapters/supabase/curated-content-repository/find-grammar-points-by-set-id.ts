import type { Database } from '@lingua-hub/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as CuratedGrammarPoint from '../../../models/curated-grammar-point'
import type { CuratedContentRepository } from '../../../ports/curated-content-repository'

export function createFindGrammarPointsBySetId(
  client: SupabaseClient<Database>,
): CuratedContentRepository['findGrammarPointsBySetId'] {
  return async ({ id, page, pageSize }) => {
    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    const { data, count, error } = await client
      .from('set_grammar_points')
      .select('curated_grammar_points(id, language, title, explanation)', {
        count: 'exact',
      })
      .eq('set_id', id)
      .order('grammar_point_id')
      .range(from, to)

    if (error) {
      throw new Error('Failed to fetch grammar points for set', {
        cause: error,
      })
    }

    return {
      items: data.map((row) =>
        CuratedGrammarPoint.dangerouslyCast(row.curated_grammar_points),
      ),
      totalCount: count ?? 0,
    }
  }
}
