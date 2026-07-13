# ADR 0007: Versioned draft persistence

## Status

Accepted in Sprint 7.

## Decision

Put draft storage behind a `DraftRepository` contract and require every write to name the version it read. A successful compare-and-swap creates the next version; a stale write returns a conflict containing current server truth. The HTTP adapter validates unknown input before calling the repository, while the browser owns debounce and visible save status.

## Consequences

Storage can change without changing product rules, concurrent tabs cannot silently overwrite one another, and conflicts are explicit product states. Clients must retain an expected version, debounce responsibly, and offer recovery instead of labelling every completed request “saved.”
