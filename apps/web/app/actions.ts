'use server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  deselectSet as deselectSetCommand,
  selectSet as selectSetCommand,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function selectSet(setId: string) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  await selectSetCommand({
    insertUserSetSelection:
      supabaseCuratedContentRepositoryFactories.createInsertUserSetSelection(
        supabase,
      ),
  })({
    userId: authResult.value,
    setId: CuratedSetId.curatedSetIdSchema.parse(setId),
  })

  revalidatePath('/sets')
}

export async function deselectSet(setId: string) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  await deselectSetCommand({
    deleteUserSetSelection:
      supabaseCuratedContentRepositoryFactories.createDeleteUserSetSelection(
        supabase,
      ),
  })({
    userId: authResult.value,
    setId: CuratedSetId.curatedSetIdSchema.parse(setId),
  })

  revalidatePath('/sets')
}
