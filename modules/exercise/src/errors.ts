import { TypedError } from '@lingua-hub/core'

export class EmptyVocabError extends TypedError {
  override readonly type = 'EmptyVocabError' as const
}
