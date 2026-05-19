import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import { supabaseCuratedContentRepositoryFactories } from '@lingua-hub/vocab'
import { SetsView } from './_components/SetsView'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export default async function SetsPage() {
  const supabase = await createClient()

  const sets =
    await supabaseCuratedContentRepositoryFactories.createFindSetsByLanguage(
      supabase,
    )({ language: TARGET_LANGUAGE })

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-lg font-semibold">Sets</h1>
      <SetsView sets={sets} />
    </div>
  )
}
