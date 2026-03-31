# exercise-module

New `modules/exercise` domain module. Contains the domain models, ports, and adapters for the exercise feature.

## Open questions

- **Vocab selection strategy** — how do we choose which vocab items to pass to the exercise generator? Random subset? Weighted by recency? Based on tags/decks? TBD.
- **Scenario design** — should the user pick a scenario category, or is it fully LLM-generated? How constrained should the scenario be?
- **Evaluation criteria** — what counts as "acceptable"? Literal accuracy, natural English, both?
- **Prompt design** — the prompts for generation and evaluation are core to the product experience and need iteration.
- **Evaluation model shape** — the `Evaluation` model represents the final state, but the response is streamed. How do we model the in-flight vs complete evaluation? Does the stream produce raw text that gets parsed into an `Evaluation` at the end, or structured chunks? This affects both the domain model and how the UI consumes the stream.

## Domain models

| Model | Fields |
|-------|--------|
| `ExerciseId` | Branded UUID |
| `ScenarioFrame` | `setting: string`, `situation: string` |
| `Exercise` | `id`, `japaneseSentence`, `scenarioFrame`, `vocabUsed: VocabItem[]` |
| `Evaluation` | `exerciseId`, `isAcceptable`, `feedback`, `suggestedTranslation` |

## Ports

**`ExerciseGenerator`** — non-streaming. Takes `VocabItem[]`, returns `ResultAsync<Exercise, UnexpectedExerciseError>`.

**`TranslationEvaluator`** — streaming. Takes `(exercise, userTranslation)`, returns a streamed result (concrete stream type depends on what `llm-module` exposes).

## Adapters

**`LlmExerciseGenerator`** — implements `ExerciseGenerator` using the `LlmClient` port from `@lingua-hub/llm`. Calls `createMessage`, parses structured response into an `Exercise`.

**`LlmTranslationEvaluator`** — implements `TranslationEvaluator` using the `LlmClient` port. Calls `streamMessage`, returns the stream.

## Use case

**`generateExercise`** — orchestrates: fetch vocab via `VocabRepository`, select items (strategy TBD), pass to `ExerciseGenerator`, return `Exercise`.

## File layout

```
modules/exercise/
  package.json
  tsconfig.json
  src/
    index.ts
    errors.ts
    generate-exercise.ts
    models/
      index.ts
      exercise-id.ts
      scenario-frame.ts
      exercise.ts
      evaluation.ts
    ports/
      exercise-generator.ts
      translation-evaluator.ts
    adapters/
      exercise-generator/
        llm-exercise-generator.ts
      translation-evaluator/
        llm-translation-evaluator.ts
```

## Depends on

- `llm-module` — adapters use the `LlmClient` port
- `@lingua-hub/vocab` — for `VocabItem` type and `VocabRepository` port
