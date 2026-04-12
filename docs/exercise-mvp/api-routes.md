# api-routes

Next.js API route handlers in `apps/web` that wire everything together.

## Routes

**POST `/api/exercise/generate`** (non-streaming) — route skeleton shipped; LLM wiring deferred
1. Authenticate user → extract `UserId` from Supabase session
2. Wire deps: `VocabRepository` via `supabaseVocabRepositoryFactories`; `LlmClient` is a `{} as any` placeholder until the LLM-wiring follow-up.
3. Call `generateExercise(deps)({ userId })`
4. Return JSON `Exercise` (or 500 from the placeholder `llmClient` until the follow-up lands)

**POST `/api/exercise/evaluate`** (streaming) — **deferred**. Blocked on the evaluation slice in `exercise-module` (no `evaluateExercise` command, `Evaluation` model unresolved).

## Supporting code

- `apps/web/lib/env.ts` — `ANTHROPIC_API_KEY` (server-only, no `NEXT_PUBLIC_` prefix) will be added with the LLM-wiring follow-up.
- `apps/web/lib/auth.ts` — extracts authenticated `UserId` from the Supabase session, returning a `Result`.

## File layout

```
apps/web/
  lib/
    auth.ts         (shipped)
  app/
    api/
      exercise/
        generate/
          route.ts  (shipped — placeholder llmClient)
        evaluate/
          route.ts  (deferred)
```

## Depends on

- `@lingua-hub/exercise` — `generateExercise` use case, types
- `@lingua-hub/vocab` — `supabaseVocabRepositoryFactories`, `VocabRepository` port
- `@lingua-hub/core` — `UserId`
- `@lingua-hub/llm` — `claudeLlmClientFactories` (deferred: used once LLM wiring lands)
