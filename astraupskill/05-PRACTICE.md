# 05 — Guided changes and an integration capstone

[Course home](README.md) · [Testing lesson](04-TESTING-AND-DEBUGGING.md) · [Hints and review](06-SOLUTIONS-AND-REVIEW.md)

These assignments extend the delivered repairs. They are proposed work for a learner, not completed features. Make one small change at a time, use synthetic data and keep a record of predictions, failures and review decisions.

## 1. Reconstruct the publication bug

Using the [trace lab](07-TRACE-LAB.md), publish one form under two addresses. Record owner identity, version, snapshot ID and the result of sending the same caller key to each snapshot. Explain why the old ID construction could affect submission deduplication even though it lived in a different repository.

Acceptance: your explanation names both repositories, shows the two snapshots remain distinct and distinguishes old-address behavior from a redirect. You can reproduce the rejected-owner response without changing the original public form.

## 2. Add explicit defensive-copy evidence

Story: a maintainer wants confidence that callers cannot rewrite published history by mutating returned objects.

Add a repository test that changes nested data on a returned publication, then reads the stored snapshot again. Also mutate an item returned by `listVersions` and verify a subsequent list/read is unchanged. Use a nested choice option rather than only the top-level title so a shallow-copy implementation would fail.

Acceptance: the tests would fail if `structuredClone` were replaced with a shallow object spread. Explain why TypeScript `readonly` alone does not protect against all runtime callers or nested shared references.

## 3. Specify submission retry equivalence

The current submission repository returns the existing record for the same publication/key without comparing changed answers. Design a conflict outcome for a reused key carrying different answer content.

Before coding, define equality: does object key order matter, are omitted optional answers equivalent to explicit empty values, and can checkbox false differ from a missing answer? Use the existing `AnswerValue` model; do not compare JSON strings without considering ordering and normalization.

Acceptance: an identical retry returns the original receipt, a changed payload returns a stable conflict without replacing stored answers, and another publication remains a separate namespace. The public conflict response must not disclose another stored response's answer content. Update repository types, API mapping and tests together.

## 4. Make a conflict-aware save UI

Story: a form editor wants to preserve local work when the server rejects an outdated version.

Design the UI states before editing. A conflict should retain the local draft and show that server data changed. Decide how the user compares, reloads or deliberately overwrites after review. Do not simply set the local version to the server's number and resend the stale schema: that can turn conflict detection into a silent lost update.

Acceptance: tests cover a server conflict, a network failure and an earlier result arriving after a later local edit. Local fields remain intact on failure. The status distinguishes pending work from accepted work. If you add a retry button, explain which version and schema it submits.

## 5. Design a durable publication adapter

Write an ADR for storing forms, public address reservations and immutable snapshots in a database. Include a unique slug constraint, a unique owner/version relationship, stable snapshot identity, defensive serialization and transaction boundaries.

Acceptance: two processes competing for the same unowned slug cannot both succeed; another form cannot reuse a reserved slug; publishing a later version cannot partially update one index while leaving the other inconsistent. Explain what readers see during publication and what survives a restart. If you implement it, use a disposable database and run adapter contract tests against both implementations.

## 6. Replace the demo header with trusted authorization

Inspect where the publishing route currently compares `x-workspace-id`. Write a permission matrix for reading drafts, editing drafts, publishing, reading public snapshots and submitting public responses. Separate public operations from authenticated editor operations.

Acceptance: a caller cannot gain editor access by changing a URL or header; a valid user in another workspace cannot read/edit the draft; public reads remain available according to the product policy. Tests should use two actual identities/workspaces and assert behavior, not merely that a permission helper was called.

This is a security feature, so describe the chosen identity source and session/token lifecycle. An in-memory demonstration of a principal can support a lesson, but must not be mislabeled production authentication.

## 7. Make publications durable

Replace `InMemoryPublicationRepository` with a SQLite (or PostgreSQL) implementation behind the existing `PublicationRepository` interface in `apps/api`. The slug-ownership invariant moves from a `Map` check into the database: `CREATE UNIQUE INDEX publications_slug ON publications (slug)` plus a `workspace_id` column, so a second workspace publishing an existing slug fails on the index inside the transaction, not on a check that two concurrent requests can both pass. Acceptance: the existing `app.test.ts` publish cases pass unchanged against the new repository (the interface was the seam); a new test fires two publishes of the same slug from two workspaces concurrently (`Promise.all`) and asserts exactly one 201 and one 409 with one row; and the in-memory repository stays for the unit tests, selected by an environment variable, not by editing code.

## Capstone: connect the browser to the API honestly

The current `WorkspaceBuilder` uses a demo saver and the public browser route uses fixtures. Replace those boundaries with a typed HTTP adapter while preserving the existing pure core and component behavior.

Plan the work in small slices:

1. Load a draft and its server version before initializing an editor. Define missing-draft, loading and failed-load states.
2. Send the route-matching schema and expected version through the existing PUT contract. Keep editing responsive while showing accurate pending/saved/conflict states.
3. Publish through the actual API, handle `slug_unavailable`, and show the resulting public address without assuming the old ID format.
4. Load a public snapshot and submit answers with one retained key per logical response attempt.
5. Add a browser-to-API test with isolated storage. Refresh and navigate deliberately; state what persists and what is lost with the chosen adapter.

Acceptance: a test verifies a real request rather than only a mocked local callback; failed saves retain local data; a route change cannot apply a late response to another form; publication and submission errors are useful to the user; the README accurately describes the new behavior. If storage remains in memory, say so explicitly and test the restart limitation separately from ordinary browser refresh.

## Completion evidence

Submit a concise change description, source map, meaningful regressions, a successful run transcript and a short list of remaining limits. Have another engineer challenge your version and ownership model. Your ability to revise it with evidence is a stronger learning outcome than a large unreviewed diff.
