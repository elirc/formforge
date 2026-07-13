# Simulated incident postmortem: stale autosave overwrote status

**Date:** 2026-07-13

**Severity:** SEV-2 simulation

**User impact:** an author could see an older save finish after a newer edit and receive misleading saved-version state.

## Timeline

- 09:00 — synthetic latency injection reversed two save completions.
- 09:07 — support scenario reproduced a stale status after rapid edits.
- 09:18 — incident owner isolated concurrent effect callbacks sharing version state.
- 09:31 — a controlled-promise regression test failed on the old implementation.
- 10:02 — serialized, version-aware writes passed the counterexample and full gate.

## Root cause

Debouncing limited how often saves started but did not serialize requests already in flight. The UI treated completion order as edit order. Review focused on the debounce timer and missed the independent concurrency invariant.

## Resolution and prevention

The autosave hook now queues writes, passes the latest accepted version to the next request, and allows only the newest request to update visible state. Sprint 14 preserves the red/green commits. The operational lesson is to test asynchronous code with controlled promises, not sleeps.
