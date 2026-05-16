# Next.js Data Layer

Three patterns for server-client data flow in the App Router.

## Server Components

Server Components for reads tied to page rendering. Data is fetched on the server during render and streamed to the client as HTML. No API layer is involved.

```ts
export default async function SetListPage() {
  const supabase = await createClient()
  const sets = await getCuratedSets(supabase)
  return <SetList sets={sets} />
}
```

## Server Actions

Server Actions for mutations triggered by the UI (create, update, delete, form submissions). Actions run on the server and are invoked from client components via the framework's RPC mechanism. Pair with `revalidatePath` / `revalidateTag` to keep server-rendered data in sync.

```ts
'use server'

export async function selectSet(userId: UserId, setId: CuratedSetId) {
  const supabase = await createClient()
  await selectSetCommand({
    insertUserSetSelection: createInsertUserSetSelection(supabase),
  })({ userId, setId })
  revalidatePath('/sets')
}
```

Client invokes directly:

```ts
'use client'

export function SetSelector() {
  return <button onClick={() => selectSet(userId, setId)}>Select</button>
}
```

## Route Handlers

Route Handlers (`app/api/*`) for anything requiring a stable HTTP endpoint: streaming responses (e.g. LLM output), webhooks, OAuth callbacks, file up/downloads, cron targets, and APIs consumed by non-Next clients (mobile, third parties, CLIs).

## Rule of thumb

- **Page needs data on load** → Server Component
- **UI changes server state** → Server Action
- **Something external talks HTTP, or we need streaming / custom response semantics** → Route Handler

## Trade-offs accepted

- Server Actions are not independently callable via HTTP/curl — they're framework RPC only.
- If requirements shift toward non-browser clients (mobile app needing the same mutations), those mutations would need to be additionally exposed as Route Handlers, duplicating the command layer.
- Server Components cannot be interactively paginated by the client without additional Route Handlers or client-side fetching.
