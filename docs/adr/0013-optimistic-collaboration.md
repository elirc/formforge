# ADR 0013: Optimistic collaboration

## Status

Accepted in Sprint 13.

## Decision

Comments render immediately with temporary client identity and pending status, then reconcile to the server record. Mentions are parsed in the domain layer. Version history compares immutable schema snapshots by stable field ID rather than array position.

## Consequences

Collaboration feels responsive, server identity remains authoritative, and reordering fields does not create false add/remove diffs. Mutation failure is a first-class state that needs explicit rollback or retry behavior; Sprint 14 will add the adversarial test that completes that contract.
