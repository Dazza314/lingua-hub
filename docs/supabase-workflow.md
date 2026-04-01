# Supabase workflow

We use a remote-only workflow — no local Docker stack. Migrations are SQL files committed to the repo and pushed to the remote project via the Supabase CLI.

## Setup (once)

1. Create a project at [supabase.com](https://supabase.com)
2. Install the CLI if needed: `brew install supabase/tap/supabase`
3. Log in: `supabase login`
4. Link the repo to your project: `supabase link --project-ref <your-project-ref>`

The project ref is in your Supabase dashboard URL: `supabase.com/dashboard/project/<ref>`.

## Creating a migration

```sh
supabase migration new <descriptive-name>
```

This creates a timestamped SQL file in `supabase/migrations/`. Edit it with your DDL, then commit it.

## Applying migrations to the remote database

```sh
supabase db push
```

This applies any migrations that haven't been run yet on the remote project.

## Checking migration status

```sh
supabase migration list
```

Shows which migrations have been applied remotely and which are pending.
