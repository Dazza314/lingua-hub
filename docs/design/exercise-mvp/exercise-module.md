# exercise-module

`modules/exercise` — domain module for generating translation exercises from a learner's vocabulary. Uses `LlmClient` from `@lingua-hub/llm` to produce structured output, and `VocabRepository` from `@lingua-hub/vocab` to source vocab items.

## Status

- **Generation slice** — shipped. `generateExercise` use case composes `VocabRepository.getVocabItems` + `LlmClient.generateObject` to produce an `Exercise`. Random sampling with default `count: 5`.
- **Evaluation slice** — not yet designed. See open questions below.

## Open questions (evaluation slice)

- **Scenario design** — should the user pick a scenario category, or is it fully LLM-generated? How constrained should the scenario be?
- **Evaluation criteria** — what counts as "acceptable"? Literal accuracy, natural English, both?
- **Prompt design** — the prompts for generation and evaluation are core to the product experience and need iteration.
- **Evaluation model shape** — the `Evaluation` model represents the final state, but the response will be streamed. How do we model the in-flight vs complete evaluation? Does the stream produce raw text that gets parsed into an `Evaluation` at the end, or structured chunks (`DeepPartial<Evaluation>` via `LlmClient.streamObject`)? This affects both the domain model and how the UI consumes the stream.
- **Vocab selection strategy (beyond MVP)** — currently uniform random sampling. Do we want weighting by recency, tag/deck filters, spaced-repetition signals?

## Domain models

| Model           | Fields                                                           | Status   |
| --------------- | ---------------------------------------------------------------- | -------- |
| `ScenarioFrame` | `setting: string`, `situation: string`                           | Shipped  |
| `Exercise`      | `language`, `sentence`, `scenarioFrame`                          | Shipped  |
| `Evaluation`    | `exerciseId`, `isAcceptable`, `feedback`, `suggestedTranslation` | Deferred |

Notes:

- `vocabUsed: VocabItem[]` was in an earlier draft but has been dropped from the MVP `Exercise` model. Revisit once there's a concrete UI need.
- **`ExerciseId` was dropped** along with an earlier draft's `id` field. Today nothing in the generation slice needs it (no persistence, no evaluator correlator). When the evaluation slice lands and actually needs to correlate an evaluation to an exercise, the id (and where it gets minted — at generation? at persistence?) should be reintroduced as part of that change. The current command returns whatever `llmClient.generateObject` produces with zero transformation.

## Use case

**`generateExercise(deps)`** — `deps: { generateObject, getVocabItems }`. Returns a function `({ userId, targetLanguage, count = 5 }) => ResultAsync<Exercise, UnexpectedExerciseError>`.

Orchestration:

1. Fetch vocab for the user filtered by `targetLanguage` via `getVocabItems({ userId, language: targetLanguage })`.
2. Random-sample `count` items.
3. Call `generateObject` with a system prompt that names `targetLanguage` explicitly and a user prompt built from the sampled vocab. Merge `language: targetLanguage` onto the LLM response to produce a self-describing `Exercise`.

## Why no ports/adapters (yet)

An earlier draft of this module defined an `ExerciseGenerator` port and a `LlmExerciseGenerator` adapter. Both were dropped: `LlmClient` is already the vendor abstraction, so `LlmExerciseGenerator` would only forward calls. We introduce ports when we have (or concretely anticipate) _multiple_ implementations of a capability — today there is only one exercise generation strategy (LLM). If a rule-based generator or pre-built bank appears later, extracting an `ExerciseGenerator` port at that point is mechanical because the orchestration is already isolated in one function.

Persistence is the next capability that _will_ introduce a port. When `ExerciseRepository` lands, `ports/` and `adapters/` directories get created naturally alongside it.

Rule of thumb: **don't manufacture ports to look symmetric with other modules — let real variation justify them.**

## File layout

```
modules/exercise/
  package.json
  tsconfig.json
  src/
    index.ts
    errors.ts
    commands/
      generate-exercise.ts
    models/
      index.ts
      scenario-frame.ts
      exercise.ts
```

Future (not yet):

```
    ports/
      exercise-repository.ts
      translation-evaluator.ts       # evaluation slice
    adapters/
      exercise-repository/
        supabase-exercise-repository/
      translation-evaluator/
        llm-translation-evaluator.ts  # evaluation slice
```

## Depends on

- `@lingua-hub/llm` — `LlmClient` type + `claudeLlmClientFactories` (used at the composition root, not here)
- `@lingua-hub/vocab` — `VocabItem` type and `VocabRepository` port
- `@lingua-hub/core` — `Language`, `UserId`, `makeParse`, `ValidationError`
