'use server'

import { requireAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getGrammarPage,
  getVocabPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'

export async function loadGrammarPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  await requireAuthenticatedUserId()

  const supabase = await createClient()
  return getGrammarPage({
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
  await requireAuthenticatedUserId()

  const supabase = await createClient()
  return getVocabPage({
    findVocabItemsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindVocabItemsBySetId(
        supabase,
      ),
  })(params)
}
