# Sprint 07: Draft persistence and autosave

## Outcome

FormForge now has a storage-agnostic, workspace-isolated draft repository, optimistic version checks, validated draft endpoints, and a builder save bar with debounced status feedback.

## Evidence

- Repository tests cover tenant isolation, compare-and-swap conflicts, and defensive copies.
- API tests cover successful writes, stale writes, and malformed boundary input.
- UI tests use a fake clock to prove the quiet-period delay and visible conflict state.

## Review prompts

- Why is debounce insufficient to prevent lost updates?
- Which layer owns runtime validation, and which owns version comparison?
- How would you test two in-flight writes that resolve out of order?
