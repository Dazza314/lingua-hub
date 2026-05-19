import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  getExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import {
  getSetsForLanguage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { ExerciseView } from './_components/ExerciseView'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export default async function Page() {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  const userId = authResult.value

  const [sets, policy] = await Promise.all([
    getSetsForLanguage({
      findSetsByLanguage:
        supabaseCuratedContentRepositoryFactories.createFindSetsByLanguage(
          supabase,
        ),
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
    />
  )
}
