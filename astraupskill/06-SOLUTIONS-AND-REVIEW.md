# 06 — Solutions, tradeoffs and a mid-level review

[Course home](README.md) · [Attempt the exercises first](05-PRACTICE.md) · [Trace lab](07-TRACE-LAB.md)

These notes give the reasoning a strong solution should contain. They are not additional implemented features. Use them to review your own work after an attempt, and preserve any deliberate differences in a design note.

## The three identities, in the code that assigns them

`packages/data/src/publications.ts:47` assigns all three in one place: the slug is checked for ownership, the version is derived per form, and the snapshot id is an independent UUID. The stored schema is cloned on the way in, and `copyPublication` clones on the way out.

```ts
  async publish(input: PublishInput): Promise<PublishedForm> {
    const versions = this.#bySlug.get(input.slug) ?? [];
    const owner = versions[0];
    if (owner && (owner.workspaceId !== input.workspaceId || owner.formId !== input.formId)) {
      throw new PublicationSlugConflictError();
    }
    const formKey = JSON.stringify([input.workspaceId, input.formId]);
    const formVersions = this.#byForm.get(formKey) ?? [];
    const version = formVersions.length + 1;
    const publication: PublishedForm = {
      id: globalThis.crypto.randomUUID(),
      workspaceId: input.workspaceId,
      formId: input.formId,
      slug: input.slug,
      version,
      schema: structuredClone(input.schema),
      publishedAt: this.#now().toISOString(),
    };
    this.#bySlug.set(input.slug, [...versions, publication]);
    this.#byForm.set(formKey, [...formVersions, publication]);
    return Promise.resolve(copyPublication(publication));
  }
```

## Why a header-as-identity demo must never ship, and what replacing it looks like

`x-workspace-id` is read straight from the request; anyone can send any value, so the "authorization" in the publish route is a suggestion. The capstone replaces it with a minimal session lookup: a `sessions` table (`id`, `user_id`, `expires_at`), a `Cookie: session=<id>` set by a `POST /login` fixture, a Fastify `onRequest` hook that loads the session and its memberships, and a route check `if (!request.user.workspaces.includes(request.params.workspaceId)) return reply.code(404).send()` (404, so a non-member cannot enumerate workspaces). The header disappears entirely; tests use `app.inject` with the cookie from the login fixture. The lesson is not the session table, it is the direction of trust: identity must come from something the server issued and can verify, never from something the caller typed.

## Publication identity and defensive copies

One form publishing under a second slug should not reuse the first snapshot's identity. A public address tells a client where to find a snapshot; a snapshot ID tells downstream storage which immutable content a response refers to. Version is a readable sequence within the owner/form history. These roles remain separate even if their values happen to look similar in a small example.

For the defensive-copy exercise, mutate `schema.fields` or a nested choice option on a returned snapshot. Then obtain a new read and compare it with the original expected value. A shallow spread would protect top-level assignments but still share nested arrays/objects. The current `structuredClone` boundary should preserve the stored snapshot.

Do the same through `listVersions`; otherwise a repository can be safe through its detail method but leak mutable references through its collection method. This is a useful pattern for any repository that returns stored objects to callers.

## Submission equality needs a policy

A good changed-payload retry design separates three outcomes: newly created response, identical replay, and reused key with different normalized answers. It does not silently convert a changed request into a replay success.

Object key order usually should not change the meaning of answer data. Missing versus empty answers may or may not be equivalent depending on field semantics. Checkbox false is not automatically the same as absence, especially for required consent. Write examples of each case before implementing equality. A canonical representation can help, but it must follow the domain's normalization rules rather than invent them.

The repository's conflict result does not need to expose stored answers. The API can return a stable conflict code and let the original client retain its draft. Treat a caller-provided retry token as an idempotency mechanism, not as proof that a caller is entitled to view somebody else's response content.

## Save conflicts and uncertain network results

If the server explicitly returns a version conflict, keep the local draft, obtain/show the current server version and let the user choose a meaningful resolution. Automatically replacing `expectedVersion` with the server's number and resending the same stale schema bypasses the protection the version was intended to provide.

If the connection fails, you may not know whether the server committed. That is a different state from a known 409. Your adapter needs a reconciliation strategy—such as loading the current draft and comparing versions/content—before claiming the local state is saved or overwriting it. The current hook's sequence guard only protects which status message is displayed. It is not a complete recovery protocol for a networked editor.

When you test the integration, simulate a save that commits but whose response is lost. A mock that always fails before touching server state does not cover this uncertainty.

## Durable storage design

A reasonable relational design has a form identity scoped by workspace, public slug reservations owned by that form, and immutable publication rows with a stable ID and a unique per-form version. You can model an address as a reservation plus a pointer to its latest published snapshot or as a versioned address history. Choose based on how the product treats renamed/retired links.

The important properties are not the table names. Publication must not partially commit its new snapshot while leaving an address pointing to an inconsistent state. Two competing publishers need a database-enforced ownership/uniqueness boundary. Version assignment needs serialization or a conditional operation that prevents duplicate owner/version pairs.

Run contract tests with two database connections if you implement this adapter. JavaScript `Promise.all` against one synchronous map does not establish cross-process database correctness. Also define deletion and retention: removing a publication still referenced by submissions can destroy the meaning of historical answers.

## Frontend/API integration design

Put HTTP translation in a small typed adapter. Components should understand outcomes such as saved, conflict and unavailable; they should not each duplicate URL construction, response parsing and English-message matching. Keep runtime parsing at untrusted boundaries even when the client has TypeScript types.

Load a draft and its version before initializing a stateful editor. Passing a later prop to a reducer initialized from an earlier prop does not automatically reinitialize its state. Decide whether to remount by form identity, dispatch an explicit load action, or isolate a route-specific editor component. Test navigation while a load/save is still in flight so a response for form A cannot overwrite form B.

For public submission, retain one key for one logical attempt and only generate a new key for a deliberate new response. Disable duplicate interaction while pending, but still preserve server-side idempotency because two tabs or a network retry can bypass a button guard.

## Authorization design

The trusted actor should come from the chosen authentication system, not a URL/header the caller can freely edit. Authorization then checks whether that actor may perform this action on this resource. A role name without a resource scope is often insufficient in a multi-workspace app.

Test a positive case, an unauthenticated case, an authenticated actor from another workspace and an actor with insufficient permissions in the correct workspace. Keep public reads/submissions intentionally public only if the product policy says so. Do not accidentally require editor credentials for a public survey just because both routes share a prefix.

## Review rubric

| Skill | Weak evidence | Strong evidence |
|---|---|---|
| Codebase understanding | Repeats the README diagram | Traces actual fixture, callback and HTTP boundaries separately |
| State modeling | Adds booleans until a test passes | Explains local revision, pending request and committed server version |
| Data design | Uses slug/version/ID interchangeably | Defines each identity and its uniqueness scope |
| Validation | Checks individual types only | Checks route/body agreement and state preservation on rejection |
| Testing | Uses sleeps and happy-path responses | Controls timers/results and inspects rejected-operation state |
| Communication | Says “fully integrated” after unit tests | States the exact integration and environment verified |

Before requesting review, write one rejected alternative and why it would fail. Ask the reviewer to choose a different event ordering than your happy path. If the design cannot explain that ordering, revise the model before adding more UI conditions.
