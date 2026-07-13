# ADR 0001: Client-rendered teaching boundary

## Status

Accepted in Sprint 1.

## Context

The course needs React lifecycle, browser state, accessible interaction, and API-boundary lessons to remain visible. A full-stack framework could productively solve many of those concerns, but it would also combine routing, rendering, data loading, and deployment before the learner has models for each.

## Decision

Use a Vite-powered React application, a separate Fastify API, and a pure TypeScript core package. Packages share strict compiler and quality configuration but own their runtime boundaries.

## Consequences

The learner can trace browser, transport, and domain state independently. The repository must make loading and error behavior explicit, and it does not claim server rendering or framework-level production optimizations.
