# Command Layer

`apps/web` always calls module commands. It never calls port methods directly.

## The rule

Ports describe what infrastructure can do. Commands describe what the domain does. The web layer belongs on the outside of that boundary — it hands inputs to commands and receives results; it does not reach through to the port.

```
apps/web  →  modules/*/commands  →  modules/*/ports  →  infrastructure
```

This is enforced by convention: `apps/web` imports only from a module's public entry point (`src/index.ts`), which exports commands and domain types, not ports or adapters.

## Why not call the port directly

A port method call from `apps/web` looks harmless when the command is a one-liner. The problem is what comes later:

- **Business logic accumulates at the call site.** Validation, error mapping, auth checks, or multi-step orchestration added after the fact go into the web file instead of the module.
- **The module loses its test surface.** Commands are testable without the web framework. Logic that bypasses the command layer can only be tested through the full Next.js stack.
- **Callers couple to the port shape, not the domain shape.** Port methods use infrastructure-facing names (`findSetById`, `insertUserSetSelection`). Commands use application-facing names (`getSetById`, `selectSet`). Callers that touch ports directly absorb adapter-level details that should be hidden.

## What a command earns

A command earns its keep by doing something a port method does not: transforming inputs, composing multiple port calls, mapping errors into domain errors, or enforcing invariants. A one-liner command that forwards its arguments unchanged is a signal that the abstraction is in the wrong place — not that the command layer should be bypassed.

**The correct response to a forwarder command is not to delete it and call the port directly.** It is to ask whether the call site belongs in a composite command that does more. For example, four commands that individually forward to four port methods may collapse into one command that issues all four calls in parallel and returns a composite result — the command then earns its keep through composition.

## In practice

A command receives its port dependencies as plain function arguments (ports-as-functions):

```ts
export function makeLoadSetPage({
  findSetById,
  findVocabItemsBySetId,
  findGrammarPointsBySetId,
}: LoadSetPageDeps) {
  return async (params: { id: CuratedSetId }): Promise<SetPage> => {
    const [setResult, vocab, grammar] = await Promise.all([
      findSetById({ id: params.id }),
      findVocabItemsBySetId({ id: params.id, page: 1, pageSize: PAGE_SIZE }),
      findGrammarPointsBySetId({ id: params.id, page: 1, pageSize: PAGE_SIZE }),
    ])
    // ...
  }
}
```

`apps/web` wires the dependencies from the adapter factories into a named const, then calls the command:

```ts
const loadSetPage = makeLoadSetPage({
  findSetById: repo.createFindSetById(supabase),
  findVocabItemsBySetId: repo.createFindVocabItemsBySetId(supabase),
  findGrammarPointsBySetId: repo.createFindGrammarPointsBySetId(supabase),
})
const page = await loadSetPage({ id })
```

See [command-factory-convention.md](./command-factory-convention.md) for the naming and wiring conventions.

The web file never imports a port type or calls a factory method to get a single function it then uses on its own.

## Trade-offs accepted

- Trivial reads require a command file even when today's implementation is thin. The overhead is one file; the benefit is a stable interface that accumulates logic without touching callers.
- Commands are wired manually (no DI container). For the current scale this is intentional — see the composition-root candidate in the architecture review for how to reduce wiring boilerplate without a container.
