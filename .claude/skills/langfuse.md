---
name: langfuse
description: Query Langfuse traces, observations, and scores for the Lingua Hub project via the CLI. Use when investigating LLM call latency, token costs, errors, or trace content. Covers authentication, key CLI patterns, and project-specific gotchas.
---

# Langfuse — Lingua Hub

## Authentication

Credentials are in `apps/web/.env.local`. Load them before any CLI call:

```bash
set -a && source /home/dario/code/lingua-hub/apps/web/.env.local && set +a
```

Or if working from the lingua-hub-ui worktree:

```bash
set -a && source /home/dario/code/lingua-hub-ui/apps/web/.env.local && set +a
```

Vars used: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`.

## CLI

No install needed — `npx langfuse-cli` (package `langfuse-cli@0.0.10`).

```bash
npx langfuse-cli --host "$LANGFUSE_BASE_URL" \
  --public-key "$LANGFUSE_PUBLIC_KEY" \
  --secret-key "$LANGFUSE_SECRET_KEY" \
  api <resource> <action> [options] --json
```

For brevity, set a local alias:

```bash
LF="npx langfuse-cli --host $LANGFUSE_BASE_URL --public-key $LANGFUSE_PUBLIC_KEY --secret-key $LANGFUSE_SECRET_KEY"
```

## Common queries

### Recent traces (with cost + error summary)

```bash
$LF api traces list --limit 10 --fields "core,metrics" --order-by "timestamp.desc" --json
```

### Full trace by ID

```bash
$LF api traces get "<trace-id>" --json
```

### Observations filtered by span name

```bash
$LF api observations list \
  --fields "core,basic,io,usage,metrics" --json \
  --filter '[{"type":"string","column":"name","operator":"=","value":"exercise-generation"}]'
```

### Summarise a trace list (Python one-liner)

```bash
$LF api traces list --limit 20 --fields "core,metrics" --order-by "timestamp.desc" --json \
  | python3 -c "
import json, sys
traces = json.load(sys.stdin)['data']
for t in traces:
    print(t['id'][:8], t.get('timestamp','')[:19], 'cost:', t.get('calculatedTotalCost'), 'err:', t.get('level'))
"
```

## Resources

| Resource | Useful actions |
|----------|----------------|
| `traces` | `list`, `get <id>` |
| `observations` | `list` (supports `--fields`, `--filter`) |
| `scores` | `list`, `create` |

## Project gotchas

- **Trace `name` is always empty.** Traces are created by OpenTelemetry auto-instrumentation which doesn't set a name. Don't filter `traces list` by `--name` — it will return nothing. Span names (`exercise-generation`, `ai.generateText`, etc.) live on *observations*, not traces.
- **Project ID:** `cmpebdr4s0d7nad0e4qqayu4e` — rarely needed directly but useful for deep-linking in the UI.
- **`gemini-2.5-flash` is a thinking model.** Reasoning tokens count toward cost and latency. If a call seems slow or truncated, check `usage.totalTokens` vs `usage.completionTokens` on the observation — a large gap indicates thinking overhead. Fix with `thinkingBudget: 0` in `providerOptions.google.thinkingConfig` when thinking isn't needed.
