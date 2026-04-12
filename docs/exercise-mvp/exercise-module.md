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

| Model | Fields | Status |
|-------|--------|--------|
| `ScenarioFrame` | `setting: string`, `situation: string` | Shipped |
| `Exercise` | `sentence`, `scenarioFrame` | Shipped |
| `Evaluation` | `exerciseId`, `isAcceptable`, `feedback`, `suggestedTranslation` | Deferred |

Notes:
- `vocabUsed: VocabItem[]` was in an earlier draft but has been dropped from the MVP `Exercise` model. Revisit once there's a concrete UI need.
- **`ExerciseId` was dropped** along with an earlier draft's `id` field. Today nothing in the generation slice needs it (no persistence, no evaluator correlator). When the evaluation slice lands and actually needs to correlate an evaluation to an exercise, the id (and where it gets minted — at generation? at persistence?) should be reintroduced as part of that change. The current command returns whatever `llmClient.generateObject` produces with zero transformation.

## Use case

**`generateExercise(deps)`** — `deps: { llmClient, vocabRepository }`. Returns a function `({ userId, count = 5 }) => ResultAsync<Exercise, UnexpectedExerciseError>`.

Orchestration:
1. Fetch all vocab via `vocabRepository.getVocabItems(userId)`.
2. Random-sample `count` items.
3. Call `llmClient.generateObject` passing `exerciseSchema` directly, plus a system prompt and a user prompt built from the sampled vocab. The returned object *is* the `Exercise`.

## Why no ports/adapters (yet)

An earlier draft of this module defined an `ExerciseGenerator` port and a `LlmExerciseGenerator` adapter. Both were dropped: `LlmClient` is already the vendor abstraction, so `LlmExerciseGenerator` would only forward calls. We introduce ports when we have (or concretely anticipate) *multiple* implementations of a capability — today there is only one exercise generation strategy (LLM). If a rule-based generator or pre-built bank appears later, extracting an `ExerciseGenerator` port at that point is mechanical because the orchestration is already isolated in one function.

Persistence is the next capability that *will* introduce a port. When `ExerciseRepository` lands, `ports/` and `adapters/` directories get created naturally alongside it.

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
- `@lingua-hub/core` — `UserId`, `makeParse`, `ValidationError`

## Deferred: language generalization

The generation slice is only implicitly language-agnostic. The system prompt is written generically and the LLM is expected to infer the target language from the `term` fields of the vocab items it receives. Nothing in the domain or the call signature names a language.

Problems this leaves on the table:

- **No explicit target language on the `Exercise`.** Downstream consumers (evaluator, UI font/direction, TTS, analytics) have no way to know what language the `sentence` is in without looking elsewhere. The exercise is not self-describing.
- **Prompt cannot be tuned per language.** With no language parameter, there's no way to specialise the system prompt for a specific language (register, script, politeness, writing direction, etc.) even when we know doing so would produce better output.
- **Generation is coupled to LLM inference.** If the vocab items happen to be ambiguous across languages, or the learner's vocab is sparse, the LLM may guess the wrong target language with no way for us to correct it.
- **`GenerateExerciseInput` has no target-language input.** Callers can't request an exercise in a specific language — they get whatever the LLM infers from vocab. This doesn't match a real product where the learner picks what they're studying.
- **Vocab is not scoped by language.** `VocabItem` has no language field, so a learner with vocab across multiple languages will see them mixed into a single exercise prompt. This is a `@lingua-hub/vocab` gap but it surfaces here first.
- **Scenario frame has no language marking.** `setting`/`situation` are implicitly assumed to be in English (the display language). If the product ever needs to render scenarios in a non-English native language, that assumption becomes a bug.
