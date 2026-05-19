import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetById,
  getSetGrammarPage,
  getSetVocabPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { notFound } from 'next/navigation'
import { SetDetailView } from './_components/SetDetailView'

const PAGE_SIZE = 24

export default async function SetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const [{ id }, { tab, page }] = await Promise.all([params, searchParams])

  const currentTab = tab === 'grammar' ? 'grammar' : 'vocab'
  const currentPage = Math.max(1, parseInt(page ?? '1') || 1)

  const supabase = await createClient()
  const repo = supabaseCuratedContentRepositoryFactories

  const setResult = await getSetById({
    findSetById: repo.createFindSetById(supabase),
  })({ id: id as CuratedSetId.CuratedSetId })

  if (Result.isFailure(setResult)) {
    notFound()
  }

  const set = setResult.value

  const [vocabPage, grammarPage] = await Promise.all([
    currentTab === 'vocab'
      ? getSetVocabPage({
          findVocabItemsBySetId: repo.createFindVocabItemsBySetId(supabase),
        })({
          id: set.id,
          page: currentPage,
          pageSize: PAGE_SIZE,
        })
      : null,
    currentTab === 'grammar'
      ? getSetGrammarPage({
          findGrammarPointsBySetId:
            repo.createFindGrammarPointsBySetId(supabase),
        })({
          id: set.id,
          page: currentPage,
          pageSize: PAGE_SIZE,
        })
      : null,
  ])

  return (
    <SetDetailView
      set={set}
      tab={currentTab}
      page={currentPage}
      pageSize={PAGE_SIZE}
      vocabPage={vocabPage}
      grammarPage={grammarPage}
    />
  )
}
