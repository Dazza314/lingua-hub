import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  CuratedSet,
  getSelectedSetsForUser,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { ExerciseView } from './_components/ExerciseView'

export default async function Page() {
  const authResult = await getAuthenticatedUserId()
  const supabase = await createClient()

  const userSets: CuratedSet.CuratedSet[] = await Result.pipe(
    authResult,
    Result.andThen((authResult) =>
      Result.succeed(
        getSelectedSetsForUser({
          findSelectedSetsByUserId:
            supabaseCuratedContentRepositoryFactories.createFindSelectedSetsByUserId(
              supabase,
            ),
        })({ userId: authResult }),
      ),
    ),
    Result.unwrap([]),
  )

  return <ExerciseView userSets={userSets} />
}
