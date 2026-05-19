'use server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  ExercisePolicy,
  saveExercisePolicy as saveExercisePolicyCommand,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import {
  CuratedSetId,
  deselectSet as deselectSetCommand,
  selectSet as selectSetCommand,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

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

export async function saveExercisePolicy(
  policy: ExercisePolicy.ExercisePolicy,
) {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  await saveExercisePolicyCommand({
    upsert: supabaseExercisePolicyRepositoryFactories.createUpsert(supabase),
  })({
    userId: authResult.value,
    language: TARGET_LANGUAGE,
    policy,
  })

  revalidatePath('/exercise')
}
