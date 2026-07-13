# ADR 0010: Immutable publication and idempotency

## Status

Accepted in Sprint 10.

## Decision

Publishing creates an immutable form snapshot with a monotonic version. Public reads resolve a slug to the latest snapshot. Submission validation uses that exact snapshot, and writes require an idempotency key scoped to the publication.

Workspace identity is authenticated at the publish boundary. Public read and submit routes are anonymous by design and expose only published data.

## Consequences

Draft edits cannot change the meaning of an already accepted response, retries do not create duplicate submissions, and authorization policy is separated from public respondent access. Storage adapters must enforce atomic uniqueness for `(publication, idempotency key)` in production.
