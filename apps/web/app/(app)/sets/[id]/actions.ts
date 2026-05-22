'use server'

import { requireAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  makeGetGrammarPage,
  makeGetVocabPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'

export async function loadGrammarPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  await requireAuthenticatedUserId()

  const supabase = await createClient()
  const getGrammarPage = makeGetGrammarPage({
    findGrammarPointsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindGrammarPointsBySetId(
        supabase,
      ),
  })
  return getGrammarPage(params)
}

export async function loadVocabPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  await requireAuthenticatedUserId()

  const supabase = await createClient()
  const getVocabPage = makeGetVocabPage({
    findVocabItemsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindVocabItemsBySetId(
        supabase,
      ),
  })
  return getVocabPage(params)
}
