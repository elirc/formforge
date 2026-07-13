# ADR 0008: Recursive conditional rules

## Status

Accepted in Sprint 8.

## Decision

Represent visibility as a recursive union of leaf comparisons and `all`/`any` groups. Keep rules separate from field definitions, reference stable field IDs, evaluate against live answers, and validate authoring references before publication.

## Consequences

The evaluator is small and exhaustive, arbitrary nested expressions remain type-safe, and the renderer can derive visible fields without duplicating rule semantics. Rule validation is graph-shaped work: reference checks are necessary, while full dependency-cycle detection is reserved for the resilience sprint.
