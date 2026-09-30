# 13. Demo boundaries and honest integration

An application can contain real repositories, real API tests, and a polished browser while still using demonstration data for the visible workflow. FormForge is a useful case because [App.tsx](../../apps/web/src/App.tsx) exposes those boundaries directly. Learning to locate them prevents a common engineering mistake: assuming that a component's asynchronous signature proves it reaches the server.

## Follow the query function, not the library name

WorkspacePage calls useQuery with a workspace-specific query key and loadWorkspace. The loader awaits a resolved promise, throws for a special error workspace id, and otherwise returns demoWorkspace only when the requested id matches the fixture. It does not call fetch or an API client in this implementation.

The query library still manages useful loading and error states. The browser can demonstrate pending, unavailable, and not-found views. Those states are genuine component behavior, but their data source remains a fixture. A test showing a loading screen followed by Acme Research does not establish database retrieval or authenticated workspace access.

workspaceQueryKey includes workspaceId, so cache identity is scoped by that argument. That is a helpful design seam for a future adapter. It does not authorize the caller to access a workspace. Cache keys and security principals answer different questions; matching the URL to a cached fixture is not a permission check.

## The saver acknowledges a local counter

WorkspaceBuilder keeps a serverVersion ref initialized to zero. Its save callback compares expectedVersion with that ref, increments the ref on a match, and returns a saved result. The _nextSchema parameter is not persisted by the callback. This deliberately models conditional version responses without writing the user's schema to the API repository.

The autosave hook therefore exercises scheduling and status against an in-memory acknowledgment model. A display saying Saved version two reports that callback's result. It should not be cited as proof that the schema survives browser reload or server restart. A course extension should preserve the scheduling lesson while connecting it to an actual storage boundary explicitly.

A useful debugging question is, Where are the bytes? If the alleged save path does not serialize, send, or store the schema, a counter increment cannot establish durability. A real adapter slice should show the outgoing payload, the repository acceptance, and a fresh read that recovers the changed value independently of the component's local state.

## Public responses also use a demonstration receipt

PublicFormPage accepts only the demo form's slug and renders demoForm. Its valid-submit callback sets a fixed demo receipt string. It does not call the public submission endpoint or receive a persisted SubmissionRecord. The visible receipt teaches a response state, but it is not an operation identity from the repository.

This matters when adding retry tests. Repeatedly clicking a demo form and seeing the same fixed receipt does not test server idempotency. The repository's deduplication key includes publicationId and caller key; neither can be inferred from a hardcoded UI message. Connect the public adapter only after defining which publication the attempt belongs to and how its key survives uncertain transport results.

The browser's displayed Published snapshot v1 is likewise a fixture label. A future route should consume actual publication metadata rather than derive version from a constant or form id. Distinguish the source of each label in the interface evidence map.

## History and comments have separate demonstration seams

VersionHistory synthesizes a previous schema from the current one: it changes the title, removes consent, and modifies the name label. It then calls diffFormSchemas. The panel is a useful example of rendering change summaries, but it does not load the publication repository's actual history. Its fixed version labels and timestamps should not be treated as an audit log.

CommentsPanel accepts an injectable createComment function, with a default that constructs a local result. The separate InMemoryCommentRepository is not automatically used merely because it exists in the workspace. The adapter boundary must be traced from the actual component prop or call site.

These seams create a coherent learning opportunity: implement one honest integration at a time and preserve a demonstration mode for deterministic teaching. Removing all fixtures at once can make every failure look like a network problem. A clear composition root can choose the adapter while keeping pure components testable.

## Build an integration evidence map

For each visible capability, record component, called function, data source, side effect, and a fresh-read observation. Mark the current row demo, local storage, repository, HTTP adapter, or proposed. These labels are not judgments of quality; they identify what the evidence can support.

Then choose one row to upgrade. For draft saving, replace the saver with a typed API adapter and solve loaded-version initialization. For public response, fetch a publication and submit a retained attempt identity. For history, load actual snapshots and use the diff helper only within its documented categories. Do not claim all rows are integrated because one request reaches Fastify.

## Incident: a saved edit disappears on refresh

The user edits the form, sees Saved version one, refreshes, and returns to the demo schema. The initial investigation should inspect the save callback before blaming HTTP caching, transaction rollback, or a database migration. In the current browser path, the callback never persisted _nextSchema. The behavior reveals a mismatch between the observer's expectation and the demonstration boundary.

A repair plan should define the intended promise, then add evidence that directly supports it. If the product promises refresh survival but keeps an in-memory server repository, a browser refresh against the same running server may succeed while server restart still loses data. Those are two separate milestones. The README and UI wording should match the milestone actually implemented.

**FF-13A, eight points:** Produce the capability map for workspace load, draft save, public submission, history, and comments. Identify the actual data source for each and one claim its current evidence cannot support.

**FF-13B, six points:** Design a fresh-read test for one integration slice. Ensure the final assertion does not reuse the component's local object as its expected or observed stored result.

**FF-13C, six points:** Write an incident note for disappearing edits that distinguishes demonstration behavior, browser refresh, and server restart. Propose accurate user-facing wording for the stage you choose to implement.

Use [the browser-boundary review](review-06-browser-storage-and-optimism.md) after your source trace, then continue to [local resumption](14-local-resumption-and-component-lifetimes.md).
