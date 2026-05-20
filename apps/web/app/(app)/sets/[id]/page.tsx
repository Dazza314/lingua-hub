import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetById,
  getSetVocabPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { GrammarList } from './_components/GrammarList'
import { SetDetailView } from './_components/SetDetailView'
import { loadGrammarPage } from './actions'

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

  const vocabPage =
    currentTab === 'vocab'
      ? await getSetVocabPage({
          findVocabItemsBySetId: repo.createFindVocabItemsBySetId(supabase),
        })({
          id: set.id,
          page: currentPage,
          pageSize: PAGE_SIZE,
        })
      : null

  let grammarHydration: ReturnType<typeof dehydrate> | null = null
  if (currentTab === 'grammar') {
    const queryClient = new QueryClient()
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['set', set.id, 'grammar'],
      queryFn: () =>
        loadGrammarPage({ id: set.id, page: 1, pageSize: PAGE_SIZE }),
      initialPageParam: 1,
    })
    grammarHydration = dehydrate(queryClient)
  }

  return (
    <SetDetailView
      set={set}
      tab={currentTab}
      page={currentPage}
      pageSize={PAGE_SIZE}
      vocabPage={vocabPage}
    >
      {grammarHydration && (
        <HydrationBoundary state={grammarHydration}>
          <GrammarList setId={set.id} pageSize={PAGE_SIZE} />
        </HydrationBoundary>
      )}
    </SetDetailView>
  )
}
