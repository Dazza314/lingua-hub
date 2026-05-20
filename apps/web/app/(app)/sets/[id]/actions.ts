'use server'

import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetGrammarPage,
  getSetVocabPage,
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

export async function loadVocabPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  const supabase = await createClient()
  return getSetVocabPage({
    findVocabItemsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindVocabItemsBySetId(
        supabase,
      ),
  })(params)
}
