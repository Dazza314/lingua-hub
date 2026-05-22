import { requireAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  makeGetExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import {
  CuratedSetId,
  makeLoadSetPage,
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

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')
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

  const idResult = CuratedSetId.parse(id)
  if (Result.isFailure(idResult)) {
    notFound()
  }

  const supabase = await createClient()
  const repo = supabaseCuratedContentRepositoryFactories

  const userId = await requireAuthenticatedUserId()

  const loadSetPage = makeLoadSetPage({
    findSetById: repo.createFindSetById(supabase),
    findVocabItemsBySetId: repo.createFindVocabItemsBySetId(supabase),
    findGrammarPointsBySetId: repo.createFindGrammarPointsBySetId(supabase),
  })
  const getExercisePolicy = makeGetExercisePolicy({
    findByUserIdAndLanguage:
      supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
        supabase,
      ),
  })

  const [pageResult, policy] = await Promise.all([
    loadSetPage({ id: idResult.value, pageSize: PAGE_SIZE }),
    getExercisePolicy({ userId, language: TARGET_LANGUAGE }),
  ])

  if (Result.isFailure(pageResult)) {
    notFound()
  }

  const { set, vocabPage, grammarPage } = pageResult.value

  const queryClient = new QueryClient()
  queryClient.setQueryData(['set', set.id, 'vocab'], {
    pages: [vocabPage],
    pageParams: [1],
  })
  queryClient.setQueryData(['set', set.id, 'grammar'], {
    pages: [grammarPage],
    pageParams: [1],
  })

  return (
    <SetDetailView set={set} policy={policy}>
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
