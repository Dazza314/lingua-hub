# Language practice app — UI plan

A short design brief covering app layout and navigation for v1. Scope is limited to high-level structure; visual styling, content design, and interaction details are out of scope here.

## Context

- **Platforms:** Next.js web app + Android (responsive design covers both)
- **Existing:** Translation practice (JP → EN)
- **Audience:** Self-directed language learners working through curated curricula like JLPT
- **Use pattern:** Multiple short sessions per day; users open the app to practice, not browse

## Navigation

Three top-level destinations:

1. **Practice** — the default landing screen and the app's core loop
2. **Sets** — manage which vocab/grammar sets are active
3. **Settings** — account and preferences

No home/dashboard screen. Users land directly on Practice because there's only one meaningful action per session and set selection is one-time-ish (stays for weeks).

### Mobile: bottom nav

Three tabs along the bottom of the screen, always thumb-reachable. This matches the convention on both iOS and Android and is appropriate for an app users open many times a day for quick sessions.

### Desktop: left sidebar

Same three destinations as a vertical sidebar. The Practice content area becomes a centered column with more breathing room.

The navigation shape is identical across platforms — only the placement changes.

## Screens

### Practice (default landing)

- Persistent header showing active sets as ambient context (e.g. "JLPT N5 · N5 Grammar")
- Prompt card with the generated sentence and translation direction
- Answer input
- Submit/check action

The active-sets header matters because users have multiple sets active at once. A glance tells them what they're drilling without opening Sets.

**Empty state (first launch, no sets selected):** Practice shows a prompt to pick a set, with a button routing to Sets. After initial setup, every launch goes straight to a practice prompt.

### Sets

- List of available sets with multi-select toggles (not radio selection — multiple can be active simultaneously)
- Each row shows the set name and a small amount of metadata (size, type)
- Language selector at the top — currently only Japanese, but the slot exists for future languages

**Future consideration:** when custom sets ship, this screen will likely need sections or tabs for "Curated" vs "Mine." The current row-based layout has room to grow without restructuring.

### Settings

Intentionally sparse for v1.

- **Account:** Google SSO identity (avatar, name, email), sign out
- **Preferences:** Language, Appearance (light/dark/system)
- **Support:** Send feedback

Things that explicitly do _not_ belong in Settings: set selection (lives in Sets), practice mode or difficulty (would live inside Practice if/when added).

## Decisions deferred

These are not part of v1 but the layout leaves room for them:

- **Practice modes** (EN → JP, listening, etc.) — would appear as a mode switcher inside Practice, not as a separate top-level destination
- **Progress/stats** — could surface ambiently in the Practice header (streak, daily count) and/or as a dedicated tab if/when the data justifies it. Nav can accommodate a fourth item on both mobile and desktop without restructuring.
- **Custom sets and vocab import** — Sets screen is designed so a "Mine" section can be added alongside "Curated" without rebuilding the picker

## Responsive principles

- Same destinations on both platforms; only nav placement changes
- Mobile breakpoint uses bottom nav; desktop uses a fixed left sidebar
- Content column on desktop is centered and constrained (roughly 640px) so reading and typing don't sprawl across wide monitors
- Touch targets and tap areas sized for thumb use on mobile; hover states added on desktop

## Open questions

- Whether the first-launch flow should force a language pick (currently only Japanese, so probably not — defer until a second language ships)
- Whether the active-sets context strip on Practice should be tappable as a shortcut to Sets, or stay as static context
