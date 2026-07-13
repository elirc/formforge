# ADR 0014: Evidence-driven hardening

## Status

Accepted in Sprint 14.

## Decision

Convert each known risk into a failing regression test before repair. Preserve focus explicitly after reordering, key rows by domain identity, serialize versioned autosaves, traverse conditional dependency graphs, and roll back rejected optimistic records while retaining retry text.

Add representative axe checks, route-level analytics splitting, render and network recovery boundaries, and a raw production-asset budget enforced by `pnpm gate`.

## Consequences

Hardening work is reviewable as red/green evidence instead of an unauditable cleanup batch. The accessibility test excludes color contrast because jsdom has no layout engine; contrast remains a manual/browser audit responsibility. The bundle budget is a regression alarm, not a user-performance claim.
