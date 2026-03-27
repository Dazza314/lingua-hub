export class AnkiDroidBridgeError extends Error {
  override readonly name = 'AnkiDroidBridgeError' as const
}

export class ValidationError extends Error {
  override readonly name = 'ValidationError' as const
}
