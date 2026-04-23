import { TypedError } from '@lingua-hub/core'

export class LlmStreamError extends TypedError {
  override readonly type = 'LlmStreamError' as const
}
