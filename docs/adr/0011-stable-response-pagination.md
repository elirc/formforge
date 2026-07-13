# ADR 0011: Stable response pagination

## Status

Accepted in Sprint 11.

## Decision

Order responses by the composite key `(submittedAt, id)` and encode the last seen key as an opaque cursor. Apply filtering before ordering and pagination. CSV exports use the same filtered ordering and escape delimiters, quotes, line breaks, and spreadsheet formula prefixes.

## Consequences

Equal timestamps have a deterministic tie-breaker, later pages do not depend on fragile numeric offsets, and export order matches the explorer. The data source must support the same composite comparison when replaced by a database.
