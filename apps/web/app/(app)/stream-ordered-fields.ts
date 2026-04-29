type StringFields<T> = keyof {
  [Key in keyof T as T[Key] extends string | null ? Key : never]: unknown
}

type StreamOrderedFieldsOptions<T> = {
  reader: ReadableStreamDefaultReader<Uint8Array>
  setState: (state: Partial<T>) => void
  fieldNames: StringFields<T>[]
  speedMs?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function streamOrderedFields<T>({
  reader,
  setState,
  fieldNames,
  speedMs = 20,
}: StreamOrderedFieldsOptions<T>): Promise<T> {
  const decoder = new TextDecoder()
  let buffer = ''

  const values: Partial<Record<keyof T, string>> = {}
  const display: Partial<Record<keyof T, string>> = {}

  async function animateField(key: keyof T) {
    const target = values[key] ?? ''
    const current = display[key] ?? ''

    for (let i = current.length; i <= target.length; i++) {
      display[key] = target.slice(0, i)

      setState({
        ...display,
      } as Partial<T>)

      await sleep(speedMs + Math.random() * 10)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      return values as T
    }

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      const partial = JSON.parse(line) as Partial<T>

      // merge latest values
      for (const key of Object.keys(partial) as (keyof T)[]) {
        values[key] = partial[key] as string
      }

      // pass through non-animated fields immediately
      let hasPassThrough = false
      for (const key of Object.keys(partial) as (keyof T)[]) {
        if (!(fieldNames as (keyof T)[]).includes(key)) {
          display[key] = partial[key] as string
          hasPassThrough = true
        }
      }
      if (hasPassThrough) {
        setState({ ...display } as Partial<T>)
      }

      // 👉 animate in strict order
      for (const key of fieldNames) {
        if (values[key] == null) {
          continue
        }

        await animateField(key)
      }
    }
  }
}
