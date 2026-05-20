import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  getExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { supabaseCuratedContentRepositoryFactories } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { SetsView } from './_components/SetsView'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export default async function SetsPage() {
  const supabase = await createClient()

  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const [sets, policy] = await Promise.all([
    supabaseCuratedContentRepositoryFactories.createFindSetsByLanguage(
      supabase,
    )({ language: TARGET_LANGUAGE }),
    getExercisePolicy({
      findByUserIdAndLanguage:
        supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
          supabase,
        ),
    })({ userId: authResult.value, language: TARGET_LANGUAGE }),
  ])

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold">Sets</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Curated collections of vocabulary and grammar.
      </p>
      <SetsView sets={sets} policy={policy} />
    </div>
  )
}
