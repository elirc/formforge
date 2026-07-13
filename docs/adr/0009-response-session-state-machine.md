# ADR 0009: Response session state machine

## Status

Accepted in Sprint 9.

## Decision

Represent a respondent journey as explicit session data and pure transitions: start, answer, next, back, complete, serialize, and resume. Branches are ordered rules from a page to another page or completion. Back navigation follows visited history, not numeric page order.

## Consequences

Branching and recovery are deterministic and testable without React. The browser persists serialized sessions locally, validates them before resume, and treats corrupt or obsolete state as a new session. Page UI can focus on validation and dispatching transitions.
