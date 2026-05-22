# Command Factory Convention

Command factory functions are prefixed with `make`. Call sites wire dependencies into a named const before invoking the command.

## The rule

Every command is a factory: it takes dependencies and returns the callable command. The function is prefixed with `make` to signal this at the definition site:

```ts
export function makeGetSetById({ findSetById }: GetSetByIdDeps) {
  return (params: {
    id: CuratedSetId
  }): Result.ResultAsync<CuratedSet, CuratedSetNotFoundError> => {
    return findSetById(params)
  }
}
```

At the call site, wire deps into a named const first, then call it as a plain function:

```ts
const getSetById = makeGetSetById({
  findSetById: repo.createFindSetById(supabase),
})
const result = await getSetById({ id })
```

Not:

```ts
// avoid — two argument lists read as one noisy expression
const result = await makeGetSetById({
  findSetById: repo.createFindSetById(supabase),
})({ id })
```

## Why the `make` prefix

Without it, `getSetById(deps)` reads as a command invocation that returns a result. With it, `makeGetSetById(deps)` signals you are constructing a command, not running one. The prefix is the signal that tells the reader to expect a function back, not data.

## Why pre-wire to a const

Splitting construction from invocation separates two distinct concerns:

- The `make` line declares what capabilities this scope needs.
- The call line expresses what it does with them.

When a scope needs multiple commands, the wiring clusters at the top and the call sites are uniform single invocations:

```ts
const getSetById = makeGetSetById({ findSetById: repo.createFindSetById(supabase) })
const getExercisePolicy = makeGetExercisePolicy({ findByUserIdAndLanguage: ... })

const [setResult, policy] = await Promise.all([
  getSetById({ id }),
  getExercisePolicy({ userId, language }),
])
```

## Why currying over flat params

The alternative is to merge deps and input into a single param bag:

```ts
getSetById({ findSetById: repo.createFindSetById(supabase), id })
```

Currying is preferred because it allows a pre-wired command to be passed as a value to another command's deps. With flat params, that composition requires an explicit wrapper lambda instead:

```ts
// currying: natural composition
const evaluateExercisePolicy = makeEvaluateExercisePolicy({
  findSetWithItemsById,
  getImportedVocabItems,
})
const generateExercise = makeGenerateExercise({
  generateObject,
  evaluateExercisePolicy,
})

// flat params: requires a wrapper
const generateExercise = makeGenerateExercise({
  generateObject,
  evaluateExercisePolicy: (input) =>
    evaluateExercisePolicy({
      findSetWithItemsById,
      getImportedVocabItems,
      ...input,
    }),
})
```

## Trade-offs accepted

- Every command has two levels of function even when the factory adds no logic beyond injecting deps. The factory is the stable integration point for tests; its presence is intentional even when trivial today.
- Deps must be wired before the first use, which adds a few lines per scope. In exchange, the dependencies of each scope are visible at a glance at the top of the function.
