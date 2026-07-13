# ADR 0004: Equivalent pointer and keyboard reordering

## Status

Accepted in Sprint 4.

## Decision

Treat ordered field identity as a domain transition. Pointer drag/drop and explicit move-up/move-down buttons dispatch the same `field.move` action. Announce successful movement through a polite live region.

## Consequences

Keyboard users receive a complete workflow rather than a drag simulation. Ordering invariants have pure tests. Native drag events are sufficient for the current list; a dedicated drag library remains an option when collision detection or cross-container movement becomes product scope.
