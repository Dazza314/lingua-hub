import { TypedError } from '@lingua-hub/core'

export class VocabSourceUnavailableError extends TypedError {
  override readonly type = 'VocabSourceUnavailableError' as const
}

export class InvalidLayoutError extends TypedError {
  override readonly type = 'InvalidLayoutError' as const
}

export class VocabItemNotFoundError extends TypedError {
  override readonly type = 'VocabItemNotFoundError' as const
}
