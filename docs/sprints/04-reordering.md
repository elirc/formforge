# Sprint 04: Reordering and field library

## Outcome

Authors reorder fields by pointer drag or explicit keyboard-operable controls. Both inputs share a pure transition, preserve identity and selection, and announce the destination.

## Evidence

The reducer test verifies the ID set and selection are unchanged. The component test uses move controls, observes DOM order and the live announcement, and confirms the boundary button becomes disabled.

## Review prompts

- Why is position not a suitable identity?
- What does drag/drop offer that the keyboard path must reproduce?
- Which focus behavior is still unproven by the current test?
