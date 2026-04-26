# Doc lifecycle

Three categories of documentation in this repo:

## ADRs (`docs/adr/`)

One doc per architectural decision. Permanent — written once and not updated. If a decision changes, write a new ADR that supersedes the old one rather than editing it.

## Operational guides (`docs/`)

Living docs that describe how to work with the system (setup, workflows, conventions). Updated as the system evolves.

## Design / planning docs (`docs/design/`)

Temporary. Capture intent and options before and during implementation. Deleted — or removed in the shipping PR — once the work is done. A doc with deferred sections stays until those sections are resolved.
