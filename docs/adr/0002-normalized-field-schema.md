# ADR 0002: Discriminated field schema

## Status

Accepted in Sprint 2.

## Decision

Represent a form as ordered fields where every field has a stable ID and a literal `kind`. Variant-specific properties live only on the matching union member. Parse unknown input with Zod before it becomes a `FormSchema`.

## Consequences

React can render exhaustively and TypeScript narrows properties without assertions. Adding a field kind creates useful compiler failures. Cross-field relationships and pages will require separate normalized references rather than nesting arbitrary component data.
