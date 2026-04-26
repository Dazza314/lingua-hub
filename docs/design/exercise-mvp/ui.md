# ui

Exercise page and components in `apps/web`.

Split into two steps:

1. **[App shell](ui-app-shell.md)** — authenticated layout, nav, route guard, component library. Prerequisite for the exercise page.
2. **[Exercise page](ui-exercise-page.md)** — state machine, components, streaming evaluation. Depends on step 1.

## Decisions

- Mobile-first — Capacitor is the target platform
- No exercise configuration for MVP — just "go"
- No session progress indicator for MVP
- Streaming UX: append text incrementally as it arrives
- Empty vocab state: simple message prompting the user to sync their Anki deck
