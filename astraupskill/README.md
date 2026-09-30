# FormForge: state, identity and reliable CRUD boundaries

This course expands the short sprint notes into a practical path from junior familiarity with React/TypeScript to independent ownership of a small CRUD feature. It uses the real FormForge files and the publication/autosave improvements delivered with this folder.

Start with basic functions, objects, arrays and React components. You do not need to know every library in the workspace. The learning task is to follow data through boundaries, explain why those boundaries exist, and produce tests that distinguish correct behavior from a plausible-looking failure.

## Prerequisites and glossary

**Prerequisites:** JavaScript objects and arrays; React with `useState` and TypeScript types; HTTP routes and 403, 409 and 201. If pnpm workspaces, Turbo or `app.inject()` are new, read [00-PREREQS.md](00-PREREQS.md) first.

| term | meaning | where in this project |
| --- | --- | --- |
| workspace | the owner of forms, named here by a header that is not authentication | the `x-workspace-id` check in the publish route in `apps/api/src/app.ts` |
| draft | the editable form schema plus its version, saved with a conditional write | `DraftRecord` in `packages/data/src/drafts.ts` |
| expected version | the version the editor believed it had; a mismatch is a conflict | `input.expectedVersion !== (current?.version ?? 0)` in `packages/data/src/drafts.ts` |
| conflict result | a returned outcome, not an exception, so the caller can show server state | the `"conflict"` branch of `SaveDraftResult` in `drafts.ts` |
| publication | a frozen snapshot of one schema version under a slug, with its own id | `PublishedForm` and `publish()` in `packages/data/src/publications.ts` |
| publication version | the display number per form, distinct from the snapshot id | `const version = formVersions.length + 1;` in `publications.ts` |
| slug ownership | one public slug belongs to one workspace and form, permanently | `PublicationSlugConflictError` in `publications.ts`, mapped to 409 in `app.ts` |
| route/body agreement | refusing a body whose schema id disagrees with the route's form id | the draft `PUT` and publish `POST` handlers in `apps/api/src/app.ts` |
| idempotency key | the caller key that makes a repeated submission return the first result | `submit(publicationId, idempotencyKey, answers)` in `packages/data/src/submissions.ts` |
| autosave debounce | the delay before a queued edit is sent; it settles nothing on the server | `useAutosave(schema, save, delay)` in `apps/web/src/useAutosave.tsx` |
| stale save guard | an older completed autosave must not report a newer queued edit as saved | the `version` ref and state transitions in `useAutosave.tsx` |
| injected request | a synthetic request pushed through the whole Fastify app, with no socket | `app.inject(...)` in `apps/api/src/app.test.ts` |

## What this improvement delivers

- A public slug cannot be taken over by another workspace or another form.
- A form's publication versions increase across slug changes, and each snapshot has an independent opaque ID. Reusing a submission key against a different snapshot no longer collides because publication IDs were accidentally reused.
- Draft/publish HTTP requests reject a schema ID that disagrees with the route's form ID before storing anything.
- A completed older autosave cannot claim that a newer, still-debouncing edit is saved. The committed version is still retained for the next queued request.
- Five added regression tests first reproduced these failures, then passed after the repairs.

See [verification](VERIFICATION.md) for the final wider checks. Exercises are deliberately labeled proposed learner work; they are not counted as delivered features.

## Understand the current application before running it

The browser is a teaching demonstration: workspace/public form data comes from fixtures, and `WorkspaceBuilder` supplies an in-memory save callback. The Fastify API and its repositories are separately executable and tested. Seeing `useQuery` or an async function in the browser does not prove that it calls the API. Connecting those surfaces with real loading, persistence and recovery is a substantial extension in the practice lesson.

The API defaults to in-memory repositories. The publishing header `x-workspace-id` demonstrates a workspace check; it is not authenticated identity. Draft routes do not have production authorization. These distinctions are part of the course because a mid-level engineer must be able to separate actual behavior from an architecture diagram or a polished screen.

## Setup and commands

Use Node 22 or newer as required by the manifest and the pinned pnpm version in [package.json](../package.json). From the repository root:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd seed
pnpm.cmd dev
```

On a shell where PowerShell script execution is restricted, invoking `pnpm.cmd` avoids the blocked PowerShell shim without changing execution policy. On other systems, use `pnpm`.

The API entry point listens on `127.0.0.1:3002`; Vite prints the browser URL it chooses. The seed command verifies a demo scenario and prints a fingerprint. It is not a database migration or proof that the browser now reads persisted API data.

The normal repository gate is `pnpm.cmd gate`. On a machine with limited resources, run the same concerns with controlled concurrency:

```powershell
pnpm.cmd -r --workspace-concurrency=1 exec vitest run --maxWorkers=2
pnpm.cmd exec turbo run lint typecheck build --concurrency=2
pnpm.cmd sizecheck
pnpm.cmd seed
```

## If this fails, it means

| symptom | cause | do this |
|---|---|---|
| `pnpm install --offline` stops with a missing package | the offline store lacks one dependency (seen in the recorded run) | run the locked online install once: `pnpm.cmd install --frozen-lockfile` |
| Turbo errors about an ancestor directory or permissions | Turbo walks up from the project looking for a workspace root and hits a protected folder | run from an unrestricted path (not under a synced or system directory) |
| an API test fails with a 5 s timeout on the first parallel run | cold-start cost of the Fastify app under full parallelism | use `pnpm.cmd -r --workspace-concurrency=1 exec vitest run --maxWorkers=2` |
| `pnpm : File ... cannot be loaded` in PowerShell | the PowerShell shim is blocked by the execution policy | call `pnpm.cmd` instead of `pnpm` |

## Course sequence

Read [00-PREREQS.md](00-PREREQS.md) first if pnpm workspaces, Turbo, `app.inject()` or the workspace/form/publication nouns are new to you.

| Lesson | Evidence you will produce | Suggested time |
|---|---|---:|
| [01 Codebase map](01-CODEBASE-MAP.md) | Separate browser and API traces with real file owners | 60–90 min |
| [02 Concepts](02-CONCEPTS.md) | Predictions about versions, identity and stale results | 90 min |
| [03 Worked change](03-WORKED-CHANGE.md) | A reviewable explanation of the delivered repairs | 90 min |
| [04 Testing/debugging](04-TESTING-AND-DEBUGGING.md) | A failing regression and a precise diagnosis | 90–120 min |
| [05 Practice](05-PRACTICE.md) | Incremental changes and an independent integration | 4–8 h |
| [06 Solutions/review](06-SOLUTIONS-AND-REVIEW.md) | A defended design with meaningful failure evidence | 90 min |
| [07 Trace lab](07-TRACE-LAB.md) | A reproducible publication and autosave experiment | 60 min |

Use the estimates to plan focused sessions, not to grade yourself. Before each experiment, predict the state and response. After it, record the observation and explain any mismatch. If you need an answer immediately, read a hint, then close it and recreate the reasoning yourself.

By the end, you should be able to explain a request from route to repository, distinguish snapshot identity from a display version, protect a public resource from accidental reassignment, and reason about pending UI work without claiming that debounce solves server concurrency. Those skills transfer to contacts, tickets, inventory, invoices and other CRUD applications.


## Extended engineering course

Continue with the [extended FormForge course](extended-course/README.md): source-grounded chapters, independent exercises, incident investigations, and separate reviews.
