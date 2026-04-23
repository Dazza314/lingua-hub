# LLM module — future improvements

## `streamObject` — expose final validated `T`

**Current shape** (`src/ports/llm-client.ts`):

```ts
streamObject<T>(
  params: GenerateObjectParams<T>,
): Result.ResultAsync<
  AsyncIterable<Result.Result<DeepPartial<T>, LlmStreamError>>,
  UnexpectedLlmError
>
```

Each yielded chunk is a `DeepPartial<T>` — semantically accurate for intermediate
chunks, and matches what the AI SDK's `partialOutputStream` produces upstream. The
limitation: the _final_ chunk is (in practice) a fully-populated `T`, but the type
system can't distinguish it from intermediate partials. A caller who wants a
validated final object has to keep the last yielded partial and re-parse it against
the schema themselves.

**Preferred fix when it becomes relevant.** Split partials from the final value:

```ts
Result.ResultAsync<
  {
    partials: AsyncIterable<Result.Result<DeepPartial<T>, LlmStreamError>>
    final: Promise<Result.Result<T, LlmStreamError>>
  },
  UnexpectedLlmError
>
```

The AI SDK already exposes `result.object` as a `Promise<T>` that resolves when
streaming completes, so the adapter can wire `final` up cheaply.

**Trigger for doing this work.** The first consumer of `streamObject` that needs
the full `T` downstream — e.g. to persist it, return it from an API, or feed it
into non-streaming logic. Right now there are zero consumers, so any choice is
speculative. Revisit at the first concrete call site.
