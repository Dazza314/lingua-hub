'use server'

import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetGrammarPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'

export async function loadGrammarPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  const supabase = await createClient()
  return getSetGrammarPage({
    findGrammarPointsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindGrammarPointsBySetId(
        supabase,
      ),
  })(params)
}
