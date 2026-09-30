# 01 — Map the actual browser and API paths

[Course home](README.md) · [Next: concepts](02-CONCEPTS.md)

FormForge is a workspace with four main packages. A package boundary tells you where code is organized; it does not automatically tell you which process owns the data or whether a call crosses the network. Trace concrete functions to establish that.

## Reading order

| File | Responsibility | Reading question |
|---|---|---|
| [schema.ts](../packages/core/src/schema.ts) | Runtime parser, TypeScript types and demo schema | How does `kind` determine each field's shape? |
| [builder.ts](../packages/core/src/builder.ts) | Pure state transitions for field CRUD/reordering | What is copied when a field changes? |
| [FormBuilder.tsx](../apps/web/src/FormBuilder.tsx) | Controls, reducer dispatch and preview | Which state is canonical and which is derived? |
| [App.tsx](../apps/web/src/App.tsx) | Routes, fixtures and the demo save callback | Does the query/save function actually use fetch? |
| [useAutosave.tsx](../apps/web/src/useAutosave.tsx) | Debounce, serialization, version and visible status | Why are local edit identity and server version different? |
| [app.ts](../apps/api/src/app.ts) | Fastify routes and input/error boundaries | Which checks happen before repository mutation? |
| [drafts.ts](../packages/data/src/drafts.ts) | Versioned draft storage | What makes an expected version stale? |
| [publications.ts](../packages/data/src/publications.ts) | Immutable snapshots, slug ownership and version history | Which keys identify an owner, version and public address? |
| [submissions.ts](../packages/data/src/submissions.ts) | Submission storage and retry keys | Why must snapshot identity be unambiguous? |
| [index.ts](../apps/api/src/index.ts) | Network startup and event output | Why can tests import the app without listening on a port? |

Read `buildApi` before the network entry point. The separation lets tests instantiate the same route pipeline and use `app.inject`, avoiding an arbitrary port and an unrelated running service. The API's in-memory repositories are injected through `ApiOptions`, so a test can control them without replacing the route implementation.

## Browser editing path

```text
Field control in FormBuilder
  -> BuilderAction
  -> builderReducer: next schema
  -> rendered structure/settings/preview
  -> onSchemaChange callback
  -> WorkspaceBuilder schema state
  -> useAutosave
  -> supplied demo DraftSaver callback
```

The last callback currently increments a ref in `App.tsx`. It is not an HTTP PUT. `loadWorkspace` similarly resolves fixture data. Write this explicitly on your map. A React Query cache can wrap a local async function, and a promise can complete without network I/O.

The public browser route also demonstrates a fixture snapshot and local receipt. The API's public routes are a separate implementation surface. Testing both separately is useful, but it is not the same as proving that the browser uses those endpoints end to end.

## API draft path

PUT `/workspaces/:workspaceId/forms/:formId/draft` validates a safe nonnegative expected version, parses the schema, and now verifies that `schema.id` matches the route form. The repository checks the current version before replacing its stored snapshot. A stale write returns a conflict containing current draft information; it does not silently overwrite the newer draft.

This is optimistic concurrency: the caller says which version it based its edit on. The in-memory implementation performs its comparison and mutation synchronously before returning the promise. A database adapter would need a conditional write or equivalent transaction protocol; the TypeScript interface alone does not enforce that.

## API publication path

```text
POST workspace/form publish route
  -> demo workspace header check
  -> slug syntax check
  -> runtime schema parse and route/body identity check
  -> publishability rules
  -> PublicationRepository.publish
  -> reserve/check slug owner, assign form version and snapshot ID
  -> store defensive snapshot copies
  -> HTTP 201, or known slug conflict -> HTTP 409
```

A public slug is a shared address namespace. Its owner is a workspace/form pair. A form can publish a later snapshot under another slug, but another form cannot appropriate an existing slug. Old slugs retain the snapshots published under those addresses; they are not silently redirected to the latest snapshot under some other address.

## Responsibility boundaries

The core package models schema shape and pure domain calculations. The data package owns storage semantics such as defensive copies, version history and slug ownership. The API maps untrusted input and known storage conflicts into HTTP contracts. React owns local interaction and status display. Keeping these roles visible is more important than memorizing package names.

For example, the API can reject a malformed slug early, but only the repository sees the current slug ownership when it commits a publication. A “check availability” endpoint alone would not prevent a race between two publishers. Conversely, a repository error should not force the data package to import Fastify or construct an HTTP response.

## First independent reading task

Choose one field action—add, update, move, duplicate or remove—and follow it through the reducer and rendered preview. Record a valid case, an unknown field ID, and a boundary position. Then choose one API mutation and identify the first line where shared state changes. If you cannot find that line, you are not yet ready to explain its consistency guarantee.
