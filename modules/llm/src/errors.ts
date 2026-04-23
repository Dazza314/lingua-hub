import { TypedError } from '@lingua-hub/core'

export class UnexpectedLlmError extends TypedError {
  override readonly type = 'UnexpectedLlmError' as const
}

export class LlmStreamError extends TypedError {
  override readonly type = 'LlmStreamError' as const
}
