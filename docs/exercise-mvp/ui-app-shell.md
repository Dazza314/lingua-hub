# ui — app shell

Authenticated layout, route guard, nav bar, and component library setup for `apps/web`.

## Goals

- Unauthenticated users are redirected to `/login`
- Authenticated users land on `/exercise` after login (no separate dashboard for MVP)
- All authenticated pages share a common layout (nav bar + content area)
- shadcn/ui installed and usable for subsequent UI work

## Scope

### 1. Component library

Add **shadcn/ui** (Tailwind-native, accessible, no runtime dependency). Install only the primitives needed here (Button, initially).

### 2. Auth middleware

Next.js middleware (`middleware.ts` at root of `apps/web`) redirects:
- Unauthenticated requests to protected routes → `/login`
- Authenticated requests to `/login` → `/exercise`

Protected routes: everything except `/login` and `/auth/**`.

Reads the Supabase session cookie via `@supabase/ssr`.

### 3. Login redirect

After successful OAuth callback, redirect to `/exercise` instead of `/`.

### 4. Authenticated layout

`app/(app)/layout.tsx` — route group wrapping all authenticated pages.

- Renders a top nav bar
- No server-side auth check needed here (middleware handles it)

### 5. Nav bar

Simple mobile-friendly bar:

- App name / logo (left)
- Sign out button (right)

No other nav items for MVP.

### 6. Home page

Move `/` into the `(app)` route group (or redirect to `/exercise`). For MVP, `/` can simply redirect to `/exercise`.

## File layout

```
apps/web/
  middleware.ts
  app/
    (app)/
      layout.tsx          ← authenticated shell + nav
      page.tsx            ← redirects to /exercise
      exercise/
        page.tsx          ← (exercise page, next step)
  components/
    nav-bar.tsx
    sign-out-button.tsx
```

## Depends on

- Supabase auth already in place (`lib/supabase/`, `lib/auth.ts`) ✅
- `/auth/callback` route already exists ✅
