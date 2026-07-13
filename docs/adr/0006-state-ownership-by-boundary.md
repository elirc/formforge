# ADR 0006: State ownership by boundary

## Status

Accepted in Sprint 6.

## Decision

Use TanStack Router for shareable workspace/view identity and TanStack Query for fetched workspace state. Query keys include workspace identity. The builder reducer continues to own unsaved draft edits; transient preview controls remain component-local.

## Consequences

URLs survive refresh and sharing, server cache entries cannot cross workspaces, and local authoring interactions do not pollute navigation. The application must render loading, error, missing, and empty boundaries explicitly.
