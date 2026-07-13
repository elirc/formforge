# Revealed flaw ledger

The course kept these incidents private while they were planted so learners could experience the same review blind spots as the fictional team. Sprint 14 reveals every counterexample and repair.

| Flaw | Planted | Counterexample | Repair and lesson |
| --- | --- | --- | --- |
| Row state followed array position | Sprint 4 | Reorder while one field's settings are expanded | Key rows by `field.id`; React identity is domain identity, not display position. |
| Reorder lost keyboard focus | Sprint 4 | Move a field and assert the active control still belongs to it | Restore focus by field ID after every reorder path; equivalent controls still need focus continuity. |
| Autosave completion raced edit order | Sprint 7 | Resolve two controlled saves in the wrong order | Serialize writes and gate UI updates by request sequence; debounce is not concurrency control. |
| Conditional validation missed multi-node cycles | Sprint 8 | Validate A → B → C → A | Traverse the dependency graph with an active path; pairwise validation cannot prove a global invariant. |
| Rejected optimistic comment remained pending | Sprint 13 | Reject creation after rendering its temporary record | Remove by temporary ID and preserve retry text; optimistic updates require an explicit inverse. |

For each row, the Sprint 14 pull request contains a red commit that failed for the named reason immediately before its green repair commit. `TESTREADME.md` explains how to study that history.
