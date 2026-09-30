# 03 — Repair identities and status without mixing their owners

[Course home](README.md) · [Previous: concepts](02-CONCEPTS.md) · [Next: testing](04-TESTING-AND-DEBUGGING.md)

## A public address was treated like an unowned map key

The original publication repository looked up a slug's array, chose `versions.length + 1`, appended a snapshot and returned it. There was no check that an existing slug belonged to the same workspace and form. Publishing from another workspace therefore changed what the public address served.

The new repository reads the first snapshot under that slug as its owner. If either workspace or form differs, it throws `PublicationSlugConflictError` before either index is changed. The API recognizes that error and returns 409 with the stable code `slug_unavailable`. It does not expose the other owner's details in the conflict body.

Read [publications.ts](../packages/data/src/publications.ts) and [app.ts](../apps/api/src/app.ts) side by side. The repository owns the invariant because it sees current stored state. The API owns the HTTP mapping. A caller could still spoof the demo workspace header, so this is a data-integrity repair, not a production authentication system.

## A version belonged to the wrong namespace

The old snapshot ID combined workspace, form and the version counted under a slug. Publishing form F under slug A produced version 1; publishing the same form under slug B also produced version 1 and the same reconstructed ID. A downstream repository scoping submission retries by publication ID could then conflate two different snapshots.

The new implementation keeps two indexes:

```text
bySlug[public address] -> snapshots published at that address
byForm[workspace/form pair] -> complete version history of that form
```

Versions now come from the second index. A UUID identifies each snapshot independently of its address and display version. Both indexes are updated in the same synchronous method before its promise resolves. `listVersions` uses the form index directly instead of scanning every slug's history.

The behavior is deliberate: an old slug still serves the latest snapshot published at that old slug. It does not automatically follow a new address. If you want redirect/rename semantics instead, specify and test them as a product change. Do not silently reinterpret stored history while fixing identity.

## A valid body could name a different resource

The draft and publish routes parsed a structurally valid schema without comparing its ID to the URL. The repair adds the relation check after parsing and before storage:

```typescript
if (schema.id !== request.params.formId) {
  return reply.code(400).send({ code: "form_identity_mismatch" });
}
```

The test checks both response status and absence of stored data. An assertion that the response is 400 alone would miss a handler that wrote first and validated afterward. This is a general pattern for failed CRUD mutations: verify the state as well as the error.

## The autosave fix changes when an edit becomes current

The old hook incremented its latest-request counter when the debounce timer fired. A newer edit existed in local state before that moment, but an older response still looked current and could display “Saved version 1.” The screen briefly claimed all work was saved while edit B had not even been submitted.

The counter now advances when the effect observes the new edit, before scheduling the timer. An older save result still updates `version.current`, because that commit determines the expected version for the next save. It only loses permission to replace the newer edit's visible status.

```text
old response arrives
  -> remember committed version
  -> is this still the latest local edit?
       yes: display result
       no: leave the newer edit's queued/saving state alone
```

This is a useful review distinction: ignoring an obsolete UI message is different from ignoring a successfully committed operation. The regression resolves the earlier request while the later edit is still inside its debounce window and checks both the queued message and the next save's expected version.

## Compatibility and limits

Snapshot IDs remain strings but are now opaque UUIDs; callers must not parse the old constructed format. The repository uses memory, so no persisted publication database migration is delivered. Slug conflicts now return a documented 409, route/body mismatches return 400, and ordinary successful publication remains 201.

No new dependencies were required. No production identity provider, durable adapter, frontend/API integration or changed-payload submission-retry policy was added. Those are separate extensions in this course. A precise review states what became correct and what remains a teaching boundary.

## Your review note

Write three short paragraphs: the observable failures; the new ownership/version/status behavior; and the tests plus remaining limits. Cite the concrete files. Avoid opening with “refactored some code”: a reviewer needs to understand why the change matters before studying its implementation.
