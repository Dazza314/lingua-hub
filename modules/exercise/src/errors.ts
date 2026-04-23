import { TypedError } from '@lingua-hub/core'

export class UnexpectedExerciseError extends TypedError {
  override readonly type = 'UnexpectedExerciseError' as const
}

export class EmptyVocabError extends TypedError {
  override readonly type = 'EmptyVocabError' as const
}
