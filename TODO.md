# TODO

## User management module

A `modules/user` module is needed to handle authentication and user identity. This requires:

- Domain model for the user (including a `UserId` type)
- Auth port linking to an authentication provider (e.g. Supabase Auth)
- Adapter implementation for the chosen provider

Once this exists, add `userId` to `VocabRepository` port methods so items are scoped per user.
