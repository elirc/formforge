# Sprint 11: Response explorer

## Outcome

FormForge now filters, sorts, pages, displays, and exports response records through a responsive accessible explorer.

## Evidence

- Core tests cover cursor continuity, stable order, search, CSV edge cases, and generated quote escaping.
- React tests drive labelled filters, sort order, incremental paging, and the download contract.
- The workspace routing test now lands on the real response table instead of an empty boundary.

## Review prompts

- Why does a stable cursor need a tie-breaker after time?
- Which CSV values are dangerous even when they contain no comma?
- How can a table become card-like visually without losing table semantics?
