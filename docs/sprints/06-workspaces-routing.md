# Sprint 06: Workspaces and routing

## Outcome

FormForge has typed workspace/view URLs, workspace-isolated query keys, active navigation, and deliberate loading, error, missing, and empty states. Builder state remains local to the authoring route.

## Evidence

A core test proves query-key isolation. The route test navigates by typed params, waits for server state, asserts the requested empty boundary, and verifies active navigation semantics.

## Review prompts

- Which state must survive a shared URL?
- Why does workspace identity belong in the query key?
- What breaks if fetched data is copied into the builder reducer immediately?
