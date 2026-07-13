# ADR 0005: Separate authoring and response validation

## Status

Accepted in Sprint 5.

## Decision

Use two validation contracts. `validateSchema` checks whether authors can publish a coherent form. `validateResponse` checks respondent values against an already valid schema. The renderer uses the response contract and links an error summary to invalid controls.

## Consequences

Author configuration problems do not masquerade as respondent mistakes. Both contracts remain pure and reusable at API boundaries. Native input semantics assist users, but server-side validation remains required when public submission is implemented.
