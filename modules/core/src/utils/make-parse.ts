import { Result } from '@praha/byethrow'
import type { z } from 'zod'
import { ValidationError } from '../errors/validation-error'

export function makeParse<S extends z.ZodType>(
  schema: S,
): (data: z.input<S>) => Result.Result<z.infer<S>, ValidationError> {
  return Result.fn({
    try: schema.parse,
    catch: (err) => new ValidationError(String(err), { cause: err }),
  })
}

export function makeParseUnknown<S extends z.ZodType>(
  schema: S,
): (data: unknown) => Result.Result<z.infer<S>, ValidationError> {
  return Result.fn({
    try: schema.parse,
    catch: (err) => new ValidationError(String(err), { cause: err }),
  })
}
