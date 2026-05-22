import { getAuthenticatedUserId } from '@/lib/auth'
import { parseExerciseScope } from '@/lib/exercise-scope'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  makeGetExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import {
  makeGetSetById,
  makeGetSetsForLanguage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { redirect } from 'next/navigation'
import { ExerciseView } from './_components/ExerciseView'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>
}) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  const userId = authResult.value
  const repo = supabaseCuratedContentRepositoryFactories

  const getSetById = makeGetSetById({
    findSetById: repo.createFindSetById(supabase),
  })
  const getSetsForLanguage = makeGetSetsForLanguage({
    findSetsByLanguage: repo.createFindSetsByLanguage(supabase),
  })
  const getExercisePolicy = makeGetExercisePolicy({
    findByUserIdAndLanguage:
      supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
        supabase,
      ),
  })

  const scope = parseExerciseScope((await searchParams).scope)

  if (scope.type === 'set') {
    const [setResult, policy] = await Promise.all([
      getSetById({ id: scope.setId }),
      getExercisePolicy({ userId, language: TARGET_LANGUAGE }),
    ])
    if (Result.isFailure(setResult)) {
      redirect('/exercise')
    }
    const set = setResult.value
    return (
      <ExerciseView
        initialPolicy={policy}
        scope={{ setId: set.id, setTitle: set.title }}
      />
    )
  }

  const [sets, policy] = await Promise.all([
    getSetsForLanguage({ language: TARGET_LANGUAGE }),
    getExercisePolicy({ userId, language: TARGET_LANGUAGE }),
  ])

  return (
    <ExerciseView
      initialPolicy={policy}
      sets={sets.map((set) => ({ id: set.id, title: set.title }))}
      hasImportedVocab={false}
    />
  )
}
