# Exercise MVP

Core learning loop: generate a Japanese sentence from the user's synced Anki vocab, let them translate it to English, and stream LLM feedback on their translation.

## Flow

1. Pull a subset of the user's known vocab from the database
2. Generate a scenario frame + Japanese sentence using that vocab (single LLM call, non-streaming)
3. Display the sentence and scenario to the user
4. User inputs their English translation
5. LLM evaluates the translation and streams feedback
6. User sees result and moves to next sentence

## Data per exercise

- Japanese sentence
- Scenario frame (setting + situation)
- User's translation
- LLM evaluation + feedback

## Implementation steps

| Step                                      | Description                                                    | Depends on                          | Status |
| ----------------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ------ |
| [`llm-module`](./llm-module.md)           | `modules/llm` — LlmClient port + Claude adapter                | —                                   | done   |
| [`google-llm-adapter`](./google-llm-adapter.md) | `modules/llm` — Gemini adapter via `@ai-sdk/google`      | `llm-module`                        |        |
| [`exercise-module`](./exercise-module.md) | `modules/exercise` — models + `generateExercise` use case      | `llm-module`, `vocab-supabase`      | done (generation slice; evaluation deferred) |
| [`vocab-supabase`](./vocab-supabase.md)   | Supabase adapter for `VocabRepository` port                    | —                                   | done   |
| [`api-routes`](./api-routes.md)           | Web API routes — wire exercise + vocab + llm, auth helper, env | `exercise-module`, `vocab-supabase` |        |
| [`ui`](./ui.md)                           | Exercise page + components                                     | `api-routes`                        |        |

`llm-module` and `vocab-supabase` have no dependencies and can be built in parallel. Everything else follows the dependency chain above.
