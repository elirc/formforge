# FormForge course retrospective

## What the learner should absorb

1. **Foundations:** strict tools and semantic boundaries make later change cheaper.
2. **Typed renderer:** discriminated unions connect data design to exhaustive React behavior.
3. **Builder:** reducers make transitions inspectable and derived state prevents disagreement.
4. **Reordering:** stable identity, input equivalence, announcements, and focus are one feature.
5. **Validation:** authoring and respondent rules protect different trust boundaries.
6. **Routing:** URL, server cache, reducer, and local component state need separate owners.
7. **Autosave:** effects synchronize external work; debounce, versioning, and serialization solve different problems.
8. **Conditions:** recursive types need interpreters, graph validation, and generated counterexamples.
9. **Multi-page forms:** state machines make progress, branches, back navigation, and resume explicit.
10. **Publishing:** immutable versions and idempotency turn retries into safe behavior.
11. **Responses:** cursor ordering, CSV hardening, and accessible tables are domain decisions.
12. **Analytics:** every metric needs a denominator, time window, and exact table alternative.
13. **Collaboration:** temporary identity, reconciliation, rollback, and stable diffs form one mutation protocol.
14. **Hardening:** counterexamples expose review blind spots; accessibility and performance claims need multiple evidence layers.
15. **Readiness:** observability, seed repeatability, runbooks, and honest boundaries turn code into an operable release candidate.

## What the flaw ledger teaches

All five bugs were plausible local decisions. None required a careless engineer. Review missed them because the important invariant crossed time, identity, graph structure, or failure state. The [revealed ledger](sprints/flaw-ledger.md) shows why a specific failing counterexample is stronger teaching evidence than a retrospective explanation alone.

## Suggested next exercises

- Replace one in-memory repository with a durable adapter and write contract tests that run against both.
- Add authenticated workspace membership and prove object-level authorization for every author route.
- Build a rule editor that prevents cycles before submit while retaining server-side validation.
- Add browser automation for publish → respond → analyze and measure its flake rate over 100 runs.
- Define service-level indicators from operational events, then rehearse a readiness failure and rollback.
