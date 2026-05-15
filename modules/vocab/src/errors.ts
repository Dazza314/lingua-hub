import { TypedError } from '@lingua-hub/core'

export class VocabSourceUnavailableError extends TypedError {
  override readonly type = 'VocabSourceUnavailableError' as const
}

export class InvalidLayoutError extends TypedError {
  override readonly type = 'InvalidLayoutError' as const
}

export class ImportedVocabItemNotFoundError extends TypedError {
  override readonly type = 'ImportedVocabItemNotFoundError' as const
}

export class CuratedSetNotFoundError extends TypedError {
  override readonly type = 'CuratedSetNotFoundError' as const
}
