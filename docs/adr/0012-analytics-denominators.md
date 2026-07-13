# ADR 0012: Analytics denominators

## Status

Accepted in Sprint 12.

## Decision

Completion rate is completed journeys divided by recorded starts. Page drop-off is incomplete journeys ending on that page divided by recorded starts. Median duration uses completed journeys with valid non-negative timestamps. Choice share uses responses that answered that choice field.

## Consequences

Every percentage has a named population, missing data is not silently imputed, empty populations return deliberate zero or “not enough data” states, and tables can expose exact counts alongside visual charts.
