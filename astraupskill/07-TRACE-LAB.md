# 07 — Run the publication trace, then control an autosave race

[Course home](README.md) · [Source map](01-CODEBASE-MAP.md) · [Testing](04-TESTING-AND-DEBUGGING.md)

This lab uses the real Fastify routes and memory repositories in a disposable in-process host. It does not contact a running server, bind a port, or modify an external database. It makes the API behavior observable while keeping the browser's separate fixture behavior explicit.

## Read before running

Open [publication-trace.ts](labs/publication-trace.ts). It imports the real `buildApi` function and demo schema, then sends requests through `app.inject`. That method exercises routing, validation, error mapping and serialization without the network startup file.

From the repository root after dependency installation:

```powershell
pnpm.cmd exec tsx astraupskill/labs/publication-trace.ts
```

The script throws if an assertion fails and closes the app in `finally`. Read its small JSON summary, but also inspect the assertions: those are what make it an executable check rather than a demonstration that prints plausible output.

## Predict each stage

| Stage | Expected result | Why |
|---|---|---|
| Publish under `research-a` | 201, form version 1 | First snapshot for that owner/form |
| Publish same form under `research-b` | 201, version 2, different snapshot ID | History belongs to the form, not the address |
| Another workspace requests `research-a` | 409 `slug_unavailable` | Existing public address retains its owner |
| Read `research-a` | Original title and owner | Rejected operation did not mutate it; new address did not redirect it |
| Submit same caller token to A and B | 201 and 201 | Different snapshot IDs define separate retry namespaces |
| Retry the same submission to A | 200, original submission ID | Same snapshot and caller key are deduplicated |
| Save a schema whose ID differs from URL | 400 `form_identity_mismatch` | Relationship is checked before persistence |

Write your predictions before executing the script. If you expected a different result, identify whether you misunderstood address semantics, version scope, snapshot identity or retry scope. Those distinctions are more valuable than memorizing the response numbers.

## Add one observation without weakening the checks

Temporarily log the two publication objects using only the synthetic data in this lab. Locate workspace ID, form ID, slug, version and snapshot ID. Then remove the extra log and explain which values a client may treat as opaque.

Change only the second title and run again. The first public address should still return the original title. Next change the workspace in the conflicting request back to `acme`; predict whether republishing the same owner under the original slug should now succeed. If you make that experiment, update the temporary expectation deliberately and restore the original lab afterward.

Do not interpret repeated successful runs as durable persistence. Every run creates a fresh app and fresh maps. If you need data to survive process restart, you need a durable adapter and a different verification environment.

## Inspect the UI race separately

Run the focused React test:

```powershell
pnpm.cmd --filter @formforge/web exec vitest run src/useAutosave.test.tsx --maxWorkers=1
```

Open the test named `keeps a newer edit queued when an earlier save finishes during its debounce`. Draw two horizontal tracks: local edits/timers and save promises. The test starts A's save, creates B, resolves A before B's timer expires, then starts B.

At A's completion, two facts are true: the server has committed A, and the user has newer unsaved work B. The hook must represent both. It records A's committed version but keeps B's queued status visible. When B starts, it uses version 1 rather than the old version 0.

On a practice branch, move the revision increment back into the timer callback. Predict the failing message assertion, run the test, then restore the fix. This controlled experiment demonstrates why the timing of revision ownership matters.

## Browser versus API evidence

You can also run the Vite demo and edit fields, but its current save callback is local. A green API lab and a green React hook test do not prove a browser-to-API connection. The integration capstone asks you to implement that connection with loading, version initialization, conflict handling and navigation safety.

Your lab note should state what you ran, what each assertion protects, and what remains untested. Include one proposed failure scenario for a future durable adapter and one for a real HTTP-backed editor. That turns a small reproducible experiment into a useful review artifact.
