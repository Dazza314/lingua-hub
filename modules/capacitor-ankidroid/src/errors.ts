import { TypedError } from '@lingua-hub/core'

export class AnkiDroidBridgeError extends TypedError {
  override readonly type = 'AnkiDroidBridgeError' as const
}
