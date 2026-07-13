# Sprint 13: Comments and version history

## Outcome

FormForge now supports optimistic comments, teammate mentions, workspace/form-isolated comment storage, and human-readable schema changes between publication versions.

## Evidence

- Core tests cover normalized unique mentions, email exclusion, all diff variants, and identical snapshots.
- Data tests prove tenant/form isolation and deterministic mention extraction.
- React tests prove successful optimistic reconciliation and meaningful version-history summaries.

## Review prompts

- Which identity belongs to the client, and which belongs to the server?
- What must happen to an optimistic comment when the request fails?
- Why does a schema diff compare field IDs instead of indexes?
