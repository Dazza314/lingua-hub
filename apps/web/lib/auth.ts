import { createClient } from '@/lib/supabase/server'
import { makeParse, TypedError, UserId } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'

class UnauthenticatedError extends TypedError {
  override readonly type = 'UnauthenticatedError' as const
}

const parseUserId = makeParse(UserId.userIdSchema)

export async function requireAuthenticatedUserId(): Promise<UserId.UserId> {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }
  return authResult.value
}

export function getAuthenticatedUserId(): Result.ResultAsync<
  UserId.UserId,
  UnauthenticatedError
> {
  return Result.pipe(
    Result.try({
      try: async () => {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user) {
          throw new UnauthenticatedError(error?.message ?? 'Not authenticated')
        }
        return data.user.id
      },
      catch: (err) => {
        if (err instanceof UnauthenticatedError) {
          return err
        }
        throw err
      },
    }),
    Result.andThen((id) =>
      Result.pipe(
        parseUserId(id),
        Result.mapError(
          (cause) => new UnauthenticatedError('Invalid user id', { cause }),
        ),
      ),
    ),
  )
}
