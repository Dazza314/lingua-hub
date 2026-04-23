import { TypedError } from './typed-error'

export class ValidationError extends TypedError {
  override readonly type = 'ValidationError' as const
}
