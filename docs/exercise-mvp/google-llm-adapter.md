# google-llm-adapter

Add a Gemini adapter to `modules/llm` alongside the existing Claude adapter. Uses the Vercel AI SDK's Google provider (`@ai-sdk/google`), authenticated via Google AI Studio (`GOOGLE_GENERATIVE_AI_API_KEY`).

## Adapter

`googleLlmClientFactories` — mirrors `claudeLlmClientFactories`, but typed against `GoogleGenerativeAIProvider` from `@ai-sdk/google`. Same `LlmClient` port, same `generateObject` / `streamObject` wiring through the `ai` package.

## Package setup

- Add `@ai-sdk/google` to `pnpm-workspace.yaml` catalog
- Add `@ai-sdk/google` to `modules/llm/package.json` dependencies (keep `@ai-sdk/anthropic` — both adapters coexist)

## File layout

```
modules/llm/src/adapters/
  claude-llm-client/        (existing)
  google-llm-client/
    google-llm-client.ts
    generate-object.ts
    stream-object.ts
```

Export `googleLlmClientFactories` from `src/index.ts`.

## Auth

Google AI Studio API key, read at the composition root and passed into `createGoogleGenerativeAI({ apiKey })`. Not read inside the adapter.

## Depends on

Nothing new — leaf module change.
