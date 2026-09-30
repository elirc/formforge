# Verification record

This course accompanies the reviewed FormForge changes verified on September 8, 2026. Verification used an isolated copy of the project, Node 22.16.0, and the repository's pnpm 9.15.4 package manager. Dependencies were installed with `pnpm.cmd install --frozen-lockfile`; the application lockfile was preserved. The original project receives only the reviewed source, tests, README, course, and executable lab. Dependency directories, build output, caches, and temporary test reports are excluded from delivery.

## What passed

The unchanged baseline passed 77 tests with controlled worker concurrency. Five added regression tests then failed against the old implementation: two publication-repository cases, two API cases, and one autosave case. After the fixes, all 82 tests passed: 34 in core, 11 in data, 9 in the API, and 28 in the web package. These tests cover both the new behavior and the existing suite; the web tests use jsdom rather than a live browser.

```powershell
pnpm.cmd -r --workspace-concurrency=1 exec vitest run --maxWorkers=2
pnpm.cmd exec turbo run lint typecheck build --concurrency=2
pnpm.cmd sizecheck
pnpm.cmd seed
pnpm.cmd exec tsx astraupskill/labs/publication-trace.ts
```

All five commands completed successfully. The executable [publication trace](labs/publication-trace.ts) asserted versions 1 and 2 across a slug change, distinct snapshot identifiers, HTTP 409 for another owner's slug claim, HTTP 201 for independent submissions to the two snapshots, HTTP 200 for a retry against the first snapshot, and HTTP 400 for a route/body form identity mismatch. It used Fastify injection and disposable memory state, then closed its application instance.

The initial offline dependency installation lacked a required package, so verification used a locked online installation in the isolated workspace. A restricted filesystem invocation prevented the build tool from inspecting an ancestor directory; the same reviewed commands succeeded with normal filesystem access. A cold, fully parallel baseline run exceeded one existing API test's five-second timeout. Running workspace suites sequentially with two workers passed the unchanged baseline and final suite. Assertions and test timeouts were not weakened to accommodate these environment issues.

## What the evidence means

The tests demonstrate publication ownership, per-form version sequencing, snapshot isolation, API identity checks, and the specific queued-edit autosave race explained in [the worked change](03-WORKED-CHANGE.md). They do not prove every possible network ordering or production failure mode. A random UUID now identifies each snapshot; clients should treat that string as opaque. Memory storage needs no persisted-data migration for this change.

The browser still loads demo fixtures and uses a local autosave callback. Its integration with the HTTP API remains an explicit [practice capstone](05-PRACTICE.md). Storage is not durable, and the workspace header is a caller-provided claim rather than authenticated authorization. Existing submission deduplication does not compare changed answers under the same snapshot and idempotency key; the course makes that an extension exercise. No deployed service, live browser workflow, external provider, production identity system, or database migration was verified. Review those boundaries before presenting this project as a deployed end-to-end product.
