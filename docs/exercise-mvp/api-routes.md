# api-routes

Next.js API route handlers in `apps/web` that wire everything together.

## Routes

**POST `/api/exercise/generate`** (non-streaming)
1. Authenticate user → extract `UserId` from Supabase session
2. Wire deps: `SupabaseVocabRepository` + `LlmSentenceGenerator` (with `ClaudeLlmClient`)
3. Call `generateExercise(deps)(userId)`
4. Return JSON `Exercise`

**POST `/api/exercise/evaluate`** (streaming)
1. Authenticate user
2. Validate body with Zod: `{ exercise, userTranslation }`
3. Wire `LlmTranslationEvaluator` (with `ClaudeLlmClient`)
4. Return streamed response — format and content type depend on how the streaming evaluation model is resolved in `exercise-module`

## Supporting code

- `apps/web/lib/env.ts` — add `ANTHROPIC_API_KEY` (server-only, no `NEXT_PUBLIC_` prefix)
- `apps/web/lib/auth.ts` (new) — extract authenticated `UserId` from Supabase session, returning a `Result`

## File layout

```
apps/web/
  lib/
    env.ts          (modify)
    auth.ts         (new)
  app/
    api/
      exercise/
        generate/
          route.ts
        evaluate/
          route.ts
```

## Depends on

- `exercise-module` — domain types, adapters, `generateExercise` use case
- `vocab-supabase` — `SupabaseVocabRepository` for fetching user vocab
- `llm-module` — `ClaudeLlmClient` adapter
