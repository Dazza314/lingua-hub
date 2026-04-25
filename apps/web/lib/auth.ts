import { makeParse, UserId } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { createClient } from '@/lib/supabase/server'

class UnauthenticatedError extends Error {
  override readonly name = 'UnauthenticatedError' as const
}

const parseUserId = makeParse(UserId.userIdSchema)

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
      catch: (err) =>
        err instanceof UnauthenticatedError
          ? err
          : new UnauthenticatedError(
              err instanceof Error ? err.message : 'Auth failed',
              { cause: err },
            ),
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
