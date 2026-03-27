export class UnexpectedVocabSourceError extends Error {
  override readonly name = 'UnexpectedVocabSourceError' as const
}

export class UnexpectedVocabRepositoryError extends Error {
  override readonly name = 'UnexpectedVocabRepositoryError' as const
}

export class VocabSourceUnavailableError extends Error {
  override readonly name = 'VocabSourceUnavailableError' as const
}

export class InvalidLayoutError extends Error {
  override readonly name = 'InvalidLayoutError' as const
}

export class VocabItemNotFoundError extends Error {
  override readonly name = 'VocabItemNotFoundError' as const
}
