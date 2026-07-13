# Sprint 15: Production readiness and retrospective

## Outcome

FormForge becomes an honestly documented v1 release candidate with repeatable demo data, separate health boundaries, privacy-aware operational events, production runbooks, a simulated-incident postmortem, and a course retrospective.

## Teaching focus

- Evidence scopes: what a test, build, browser journey, audit, or runbook can and cannot prove.
- Liveness versus readiness and correlation versus payload logging.
- Restore verification, retention ownership, rollback, and incident roles.
- Communicating deployment-owned risk without disguising it as completed work.

## Evidence

- `pnpm seed` repeats the `formforge-v1` scenario and fingerprint.
- API tests cover healthy and failed readiness plus payload-free correlated events.
- `pnpm gate` checks strict compilation, 77 tests, production artifacts, and bundle budgets.
- CI additionally runs dependency audit and secret scanning.
- The release audit records desktop and narrow-viewport critical journeys.

## Exercise

Implement a durable repository adapter behind the existing interfaces. Write one contract suite that runs unchanged against the in-memory and durable implementations, then revise the backup and retention runbooks with commands that have been rehearsed.
