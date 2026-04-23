import { TypedError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'

type Serialised<E extends TypedError> = {
  type: E['type']
  message: string
} & Omit<E, keyof Error | 'type'>

function serialiseError<E extends TypedError>(error: E): Serialised<E> {
  console.error(error)
  const { cause: _cause, ...rest } = error
  return { ...rest, message: error.message } as Serialised<E>
}

export const serialiseResult = <T, E extends TypedError>(
  result: Result.ResultMaybeAsync<T, E>,
): Result.ResultMaybeAsync<T, Serialised<E>> =>
  Result.pipe(result, Result.mapError(serialiseError))

export type SerialisedResult<
  TResult,
  TError extends TypedError,
> = Result.Result<TResult, Serialised<TError>>

export type SerialisedResultAsync<TResult, TError extends TypedError> = Promise<
  SerialisedResult<TResult, TError>
>
