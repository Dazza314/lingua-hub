# llm-module

New `modules/llm` domain module. Owns the `@anthropic-ai/sdk` dependency so no other module imports it directly.

## Port

`LlmClient` with two methods:

- `createMessage(params)` — non-streaming, returns the complete response
- `streamMessage(params)` — streaming, returns a `ReadableStream`

## Adapter

`ClaudeLlmClient` — implements `LlmClient` using `@anthropic-ai/sdk`. Constructor takes the Anthropic client instance.

## Package setup

- Add `@anthropic-ai/sdk` to `pnpm-workspace.yaml` catalog
- `package.json` deps: `@anthropic-ai/sdk`, `@praha/byethrow`, `zod`
- `tsconfig.json` extends root, `rootDir: "src"`

## File layout

```
modules/llm/
  package.json
  tsconfig.json
  src/
    index.ts
    errors.ts
    ports/
      llm-client.ts
    adapters/
      claude-llm-client.ts
```

## Depends on

Nothing — this is a leaf module.
