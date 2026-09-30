# 04 — Reproduce the failure at the right layer

[Course home](README.md) · [Previous: worked change](03-WORKED-CHANGE.md) · [Next: practice](05-PRACTICE.md)

The improvement began with the existing tests and five new failing cases. The baseline had 77 passing tests when run with controlled concurrency. The new cases then failed for the expected reasons: two repository identity/ownership failures, two API contract failures and one autosave status failure. This gives stronger evidence than adding tests only after deciding the implementation is correct.

## Where each regression belongs

| Test file | Scenario | Observable guarantee |
|---|---|---|
| [publishing.test.ts](../packages/data/src/publishing.test.ts) | Another workspace or form requests an owned slug | Rejected operation leaves the original public snapshot and other history unchanged |
| [publishing.test.ts](../packages/data/src/publishing.test.ts) | Same form publishes under a new slug | Version increases, snapshot ID changes, submission namespaces remain separate |
| [app.test.ts](../apps/api/src/app.test.ts) | Valid schema names another form than the URL | HTTP 400 and no stored draft/publication |
| [app.test.ts](../apps/api/src/app.test.ts) | Another owner requests a reserved public address | HTTP 409 with stable code; public read still returns original owner |
| [useAutosave.test.tsx](../apps/web/src/useAutosave.test.tsx) | Old save finishes while a newer edit is debouncing | New edit remains queued; next save uses the committed version |

The repository tests call the real memory adapter. The API tests call `buildApi` and Fastify injection. The hook test renders a real React harness with a controlled save promise and fake timers. Each test chooses the smallest environment that can observe its failure.

## Narrow test commands

```powershell
pnpm.cmd --filter @formforge/data exec vitest run src/publishing.test.ts --maxWorkers=1
pnpm.cmd --filter @formforge/api exec vitest run src/app.test.ts --maxWorkers=1
pnpm.cmd --filter @formforge/web exec vitest run src/useAutosave.test.tsx --maxWorkers=1
```

Run the full checks from the course README after the local regression passes. Typechecking can catch an incompatible repository contract even when one runtime test succeeds; lint can catch a different class of maintainability problem; a build proves that the compiler/bundler can produce the artifacts. None alone establishes business correctness.

## Fake timers and deferred promises model different clocks

The debounce timer controls when a save becomes eligible to run. The deferred promise controls when the simulated backend completes it. Advancing fake time does not automatically mean a pending server operation finished. The regression uses both controls so it can reproduce the exact ordering that caused the bug.

First edit A and advance 300 ms so its save starts. Then edit B, advance only 100 ms, and resolve A. At that point B's timer has not fired. The UI should show queued changes. Advance the remaining 200 ms and inspect the next save call: it must contain B's schema and expected version 1.

Wrapping those operations in React Testing Library's `act` allows state/effect updates to settle before assertions. Do not replace this controlled scenario with real `setTimeout` sleeps; that would make the test depend on machine load rather than the intended ordering.

## Protect state on rejection

A conflict response is only half the evidence. The slug test reads the public address afterward and compares it to the original snapshot. The identity-mismatch test verifies that neither a draft nor a public publication was stored. The changed-slug test sends submissions to both snapshot IDs to check the downstream identity consequence.

When you write a CRUD rejection test, add the sentence “and the previous valid state remains ...” to the requirement. Then encode it in an assertion. This habit catches write-before-validate, partial updates and accidentally reused identity errors.

## Diagnose an environment failure separately

The initial restricted run could not let esbuild inspect an ancestor directory. A later fully parallel baseline exceeded the first API test's cold-start timeout while other test workers were busy. Running the same tests in the isolated copy with limited worker/workspace concurrency passed. These were recorded as environment/execution findings; the application code was not weakened or its timeout assertions deleted to hide them.

If you see a similar failure, record the command, package, exit code and first meaningful error. Distinguish a bundler permission error from an assertion mismatch. An error such as “expected 201 to be 409” is direct behavior evidence; “could not read directory” is not.

## A practical debugging path

For the wrong public form, inspect slug ownership and which snapshot each index returns. For duplicate responses across versions, compare publication IDs before inspecting the submission map. For a stale saved message, draw the timeline of local edits, timers and promise resolutions before adding another boolean flag.

Log synthetic identifiers and transitions while learning. Avoid dumping response answers or arbitrary form content into production-style logs. Operational visibility should help identify the failing boundary without becoming another source of data exposure.

## Review limits

jsdom interaction tests do not prove a real browser layout, and Fastify injection does not prove that the demo frontend calls the API. The verification page states the checks actually run. Any future claim of persistent end-to-end behavior needs a test spanning the browser adapter, API and chosen storage boundary.
