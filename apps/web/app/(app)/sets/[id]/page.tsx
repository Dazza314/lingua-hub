import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetById,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { SetDetailTabs } from './_components/SetDetailTabs'
import { SetDetailView } from './_components/SetDetailView'
import { loadGrammarPage, loadVocabPage } from './actions'

const PAGE_SIZE = 60

export default async function SetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])

  const initialTab = tab === 'grammar' ? 'grammar' : 'vocab'

  const supabase = await createClient()
  const repo = supabaseCuratedContentRepositoryFactories

  const setResult = await getSetById({
    findSetById: repo.createFindSetById(supabase),
  })({ id: id as CuratedSetId.CuratedSetId })

  if (Result.isFailure(setResult)) {
    notFound()
  }

  const set = setResult.value

  const queryClient = new QueryClient()
  if (initialTab === 'vocab') {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['set', set.id, 'vocab'],
      queryFn: () =>
        loadVocabPage({ id: set.id, page: 1, pageSize: PAGE_SIZE }),
      initialPageParam: 1,
    })
  } else {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['set', set.id, 'grammar'],
      queryFn: () =>
        loadGrammarPage({ id: set.id, page: 1, pageSize: PAGE_SIZE }),
      initialPageParam: 1,
    })
  }

  return (
    <SetDetailView set={set}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SetDetailTabs
          setId={set.id}
          initialTab={initialTab}
          pageSize={PAGE_SIZE}
          vocabCount={set.vocabCount}
          grammarCount={set.grammarCount}
          setUrl={`/sets/${set.id}`}
        />
      </HydrationBoundary>
    </SetDetailView>
  )
}
