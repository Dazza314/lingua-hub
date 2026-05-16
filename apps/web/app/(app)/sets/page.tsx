import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import { supabaseCuratedContentRepositoryFactories } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { SetsView } from './_components/SetsView'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export default async function SetsPage() {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  const userId = authResult.value

  const [allSets, selectedSets] = await Promise.all([
    supabaseCuratedContentRepositoryFactories.createFindSetsByLanguage(
      supabase,
    )({ language: TARGET_LANGUAGE }),
    supabaseCuratedContentRepositoryFactories.createFindSelectedSetsByUserId(
      supabase,
    )({ userId }),
  ])

  const selectedSetIds = selectedSets.map((s) => s.id as string)

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-lg font-semibold">Sets</h1>
      <SetsView sets={allSets} selectedSetIds={selectedSetIds} />
    </div>
  )
}
