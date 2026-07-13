# Sprint 02: Typed schema and renderer

## Outcome

FormForge models seven field variants, validates unknown schema data, and renders a live accessible preview with exhaustive TypeScript control flow.

## Evidence

Core tests cover all discriminants, invalid variant data, and generated JSON round trips. Component tests query labels and native control roles. The build proves the core schema contract crosses the workspace boundary.

## Review prompts

- Why is `kind` more useful than a collection of boolean flags?
- Which invariant exists at runtime and which exists only at compile time?
- What compiler error should appear when an eighth variant is added?
