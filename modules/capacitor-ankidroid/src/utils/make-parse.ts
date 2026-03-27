import { Result } from '@praha/byethrow'
import z from 'zod'
import { ValidationError } from '../errors'

export function makeParse<T>(
  schema: z.ZodType<T>,
): (data: unknown) => Result.Result<T, ValidationError> {
  return Result.fn({
    try: schema.parse,
    catch: (err) => new ValidationError(String(err), { cause: err }),
  })
}
