import { getAuthenticatedUserId } from '@/lib/auth'
import { parseExerciseScope } from '@/lib/exercise-scope'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  getExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import {
  getSetById,
  getSetsForLanguage,
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

  const scope = parseExerciseScope((await searchParams).scope)

  if (scope.type === 'set') {
    const [setResult, policy] = await Promise.all([
      getSetById({ findSetById: repo.createFindSetById(supabase) })({
        id: scope.setId,
      }),
      getExercisePolicy({
        findByUserIdAndLanguage:
          supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
            supabase,
          ),
      })({ userId, language: TARGET_LANGUAGE }),
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
    getSetsForLanguage({
      findSetsByLanguage: repo.createFindSetsByLanguage(supabase),
    })({ language: TARGET_LANGUAGE }),
    getExercisePolicy({
      findByUserIdAndLanguage:
        supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
          supabase,
        ),
    })({ userId, language: TARGET_LANGUAGE }),
  ])

  return (
    <ExerciseView
      initialPolicy={policy}
      sets={sets.map((set) => ({ id: set.id, title: set.title }))}
      hasImportedVocab={false}
    />
  )
}
