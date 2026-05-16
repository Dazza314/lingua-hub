# Error Handling Strategy

Lingua Hub uses two mechanisms for error handling: typed `Result` values (via [`@praha/byethrow`](https://github.com/praha-inc/byethrow)) for recoverable failures, and thrown exceptions for everything else.

## The distinction

**Use `Result<T, E>` when the caller is expected to handle the failure.** These are domain errors that represent a valid, anticipated outcome — not a bug or an infrastructure problem. The type system enforces that callers handle them. Examples:

- `CuratedSetNotFoundError` — the set ID doesn't exist; the caller can show a 404.
- `VocabSourceUnavailableError` / `InvalidLayoutError` — the AnkiDroid source can't be read; the caller can surface a specific error message.

**Throw for everything else.** Infrastructure failures (database errors, network timeouts) and schema violations (data that fails parse assumptions) are not recoverable at the call site. They propagate to the nearest error boundary (`error.tsx` in Next.js). Wrapping them in `Result` would push boilerplate handling onto every caller with no meaningful recovery path.

## In practice

Ports declare their recoverable failures explicitly in their return type:

```ts
findSetWithItemsById(params: {
  id: CuratedSetId
}): Result.ResultAsync<CuratedSetWithItems, CuratedSetNotFoundError>
```

Adapters return `Result.fail(...)` for the named domain errors, and throw for infrastructure failures:

```ts
if (error) {
  throw new Error('Failed to fetch curated set', { cause: error }) // DB error — throw
}

if (!data) {
  return Result.fail(new CuratedSetNotFoundError(`Set not found: ${id}`)) // domain error — Result
}
```

Commands consume Results and propagate failures up using early returns:

```ts
const page = await getVocabItems(layout, { deckId, limit, offset })
if (Result.isFailure(page)) {
  return page
}
```

## Why byethrow over plain union types

`@praha/byethrow` provides `Result.succeed` / `Result.fail` constructors and `Result.isFailure` / `Result.isSuccess` guards that keep the happy path readable without adding a dependency on a large functional programming library. The `TypedError` base class (from `@lingua-hub/core`) gives each domain error a discriminated `type` field so callers can switch on the error kind without `instanceof` checks.

## Trade-offs accepted

- Ports must explicitly enumerate all recoverable errors in their signatures. Failures that aren't listed there are not recoverable by design — they throw.
- Infrastructure failures that reach `error.tsx` show a generic error screen. More granular recovery would require catching and classifying infrastructure errors at the adapter boundary, which is not worth the added complexity for this project.
