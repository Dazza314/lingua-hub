# Result error handling refactor

## Current state

Module commands return `Result<T, ExpectedError | UnexpectedError>`, wrapping all failures — both expected and unexpected — in `Result`. For example:

```ts
// generateExercise currently returns:
Result<Exercise, EmptyVocabError | UnexpectedExerciseError>
```

## Problem

`Result<T, E>` should only contain errors a caller can meaningfully handle. Unexpected errors (`UnexpectedExerciseError`, `UnexpectedLlmError`, `UnexpectedVocabRepositoryError`, etc.) cannot be handled by callers — they can only be propagated. Putting them in `Result` pollutes every call site with errors that have no meaningful response.

## Target state

- **`Result<T, E>`** — expected, recoverable failures the caller should handle
- **`throw`** — unexpected failures that propagate to the nearest boundary (`error.tsx`)

```ts
// generateExercise should return:
Result<Exercise, EmptyVocabError>
```

Unexpected LLM/repo failures throw naturally and are caught by Next.js error boundaries.

## Changes required

1. **Remove `Unexpected*Error` classes** — `UnexpectedExerciseError`, `UnexpectedLlmError`, `UnexpectedVocabRepositoryError`, `UnexpectedVocabSourceError` are no longer needed as `Result` error types. Remove them or demote to plain thrown errors for logging purposes only.

2. **Update module commands** — Remove `Result.mapError` calls that catch-and-wrap unexpected errors. Let unexpected failures throw.

3. **Update `generateExercise`** — Return type becomes `Result<Exercise, EmptyVocabError>` only.

4. **Audit all other commands** — Apply the same principle across vocab, llm, and other modules.

## Outcome

Every `Result` return type in the codebase becomes semantically honest: if an error is in `Result`, it is something the caller is expected to handle.
