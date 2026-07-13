# ADR 0003: Builder reducer owns canonical schema state

## Status

Accepted in Sprint 3.

## Decision

Keep the draft schema and selected field ID in one reducer. The field list, settings panel, and preview derive their views from that state. Actions describe domain transitions and carry generated identity into the reducer rather than generating it inside.

## Consequences

Transitions remain pure and testable. Components do not synchronize duplicate copies of fields. Persistence can observe schema changes later. A single reducer may eventually be split by concern, but only after boundaries are demonstrated by product behavior.
