# ui

Exercise page and components in `apps/web`.

## Open questions

- **App shell/layout** — there is no UI beyond a landing page and login today. Before building the exercise page, we likely need a basic app layout (nav, authenticated shell, routing between features). This is a prerequisite that may warrant its own step.
- **Navigation** — how does the user get to the exercise flow? From a home/dashboard? Directly after login?
- **Mobile-first or desktop?** — the app runs on Android via Capacitor, so the exercise UI probably needs to be mobile-friendly from the start.
- **Loading/empty states** — what if the user has no synced vocab yet? Do we show an onboarding prompt?
- **Exercise configuration** — does the user choose anything before starting (deck, difficulty, number of exercises), or do they just hit "go"?
- **Progress indicators** — any sense of session progress (e.g. "3 of 10") or is it an infinite loop?
- **Streaming UX** — how should the evaluation feedback appear? Typing effect? Just appending text? Structured sections appearing one at a time?

## Page

`/exercise` — server component shell that renders the client component.

## State machine

Client component (`exercise-flow.tsx`) manages four states:

| State | Shows | Transition |
|-------|-------|------------|
| `loading` | Skeleton/spinner | → `translating` when exercise fetched |
| `translating` | Sentence + scenario + text input | → `evaluating` on submit |
| `evaluating` | Streaming feedback | → `reviewed` when stream ends |
| `reviewed` | Full feedback + "Next" button | → `loading` on click |

Simple `useState` with a discriminated union. No state management library.

## Components

- `exercise-flow.tsx` — state machine, orchestrates the flow
- `sentence-display.tsx` — shows Japanese sentence + scenario frame
- `translation-input.tsx` — textarea + submit button
- `evaluation-display.tsx` — renders streamed evaluation text incrementally

Streaming consumption: `fetch` + `response.body.getReader()`.

## File layout

```
apps/web/app/exercise/
  page.tsx
  _components/
    exercise-flow.tsx
    sentence-display.tsx
    translation-input.tsx
    evaluation-display.tsx
```

## Depends on

- `api-routes` — needs the API endpoints to call
- Likely needs an app shell/layout step to be done first or alongside
