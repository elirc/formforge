# 06. Capstone: connect the real boundaries without overstating completion

The opening route ends with a feature proposal large enough to require planning but small enough to review. Your task is to connect a browser editor to the existing draft and publication API through an explicit adapter. This course does not implement that feature in the application. It provides a specification, test plan, and assessment route for your independent work in an owned practice branch or copy.

Use [the API](../../apps/api/src/app.ts), [draft repository](../../packages/data/src/drafts.ts), [publication repository](../../packages/data/src/publications.ts), and [autosave hook](../../apps/web/src/useAutosave.tsx) as contracts to inspect. The old course's [practice chapter](../05-PRACTICE.md) identifies the browser's demonstration boundary. Recheck the actual call sites before beginning implementation because learning documents can outlive the code they describe.

## Define one vertical slice

Start with loading an existing draft and making one conditional save. Publication, public response submission, authentication, and a durable database are separate later slices. A complete small slice should show a loading state, handle not found distinctly from transport failure, preserve local edits after a rejected save, and use the loaded version correctly. The current hook's internal version starts at zero, so simply replacing a demo saver with fetch is not sufficient for an existing versioned draft.

Write the adapter contract before the component. Inputs include workspace identity, form identity, schema, and expected version. Outputs distinguish saved, conflict, missing resource where applicable, rejected input, and transport uncertainty. Do not collapse every non-200 response into conflict. A 400 identity mismatch indicates a different fault from a 409 stale version, and retrying unchanged malformed input does not help.

The response parser is another boundary. TypeScript's generic fetch return annotation does not inspect bytes. Decide which response fields must be validated before they become editor state. A malformed success response should not be allowed to set version to an arbitrary value simply because the HTTP status was successful.

## Preserve one coherent editor session

Represent the active workspace/form pair explicitly. When the route changes, the previous loading or saving operation belongs to the previous pair. A late response must not overwrite the new editor's title or version. An abort signal can reduce unnecessary work, but ownership checks remain useful because completion and cancellation can race.

The capstone should retain a local edit buffer through a save conflict. Display the server version and enough comparison information to let the user choose a next action. Reload discards local work only through an explicit product decision. A merge needs base/local/server inputs. A deliberate overwrite needs fresh confirmation and a current precondition, and even that can conflict again. Do not use the word resolved until the accepted state is observable.

There is also an initial-load race. A user should not be able to edit a placeholder schema, then have a slow initial fetch silently replace it. One straightforward proposal keeps editing disabled until load completes. Another preserves local edits and merges a loaded base, which is substantially more complex. State the chosen policy and test it.

## Add publication only after save is trustworthy

Publication currently accepts a schema body directly rather than an expected draft version. A button labeled Publish saved draft can therefore overpromise if the adapter sends an unsaved local schema or assumes the server loads its draft automatically. Decide whether your product publishes the visible schema or the last accepted draft. Name the choice in both the user flow and the test.

A publish result contains a new snapshot id, version, and slug. Display the returned values; do not reconstruct ids from form identity or infer the next version from a stale local list. A slug conflict should preserve the editor's schema and let the user choose another address or inspect ownership policy. It must not cause silent reassignment of someone else's address.

If you add public submission, retain one caller key per logical attempt and pin the intended publication semantics. A new key on every network retry defeats deduplication. Reusing one key for every edited answer can return an earlier receipt under the current repository. The UI must distinguish retry from start another response, and the server contract must support the intended distinction.

## Design evidence at three levels

At the pure model level, test editor state transitions using deterministic events. At the adapter level, send actual synthetic requests through an isolated API instance or controlled HTTP boundary. At the browser level, show that visible status and route changes match the underlying outcomes. A model test is fast and explanatory but cannot establish that the real component invokes the adapter. A browser screenshot cannot prove that a stale precondition was sent correctly.

Use a schedule instead of sleeps: load version four, edit title, begin save, switch form, resolve old save, and observe the new form. For conflicts, use two independent clients or controlled server state so both begin from the same version. Assert both the losing client's retained local schema and the server's accepted schema. A toast saying conflict is insufficient if the old schema already replaced the winner.

No existing application suites are run by reading this course. Your eventual report should distinguish planned tests from executed results, record working directory and exact command, and explain missing dependencies without weakening a gate to obtain a green label. Synthetic data and isolated repositories are enough for the initial slice.

## Submission and rubric

**FF-06A, ten points:** Produce the adapter contract and a source-linked sequence for load, save success, conflict, malformed response, and route switch. Five points require exact version ownership; five require distinct failure outcomes.

**FF-06B, ten points:** Design or implement a deterministic editor model in your own answer file. Include late load, stale save, retained conflict buffer, and independent form identities. Supply a counterexample against a model that accepts every late response.

**FF-06C, ten points:** Present an integration evidence plan and a reviewable publication decision. Explain which schema is published, how snapshot identity is retained, and what the current API does not guarantee. Separate implemented features from proposed extensions.

A passing capstone requires at least twenty-two of thirty points and no silent loss of local work in the stated acceptance traces. Excellent work explains why its tests fail under plausible mutations and identifies its remaining persistence and authorization limits. Continue future modules from the [course index](README.md); compare the opening route with [the separate review](review-02-scheduling-and-integration.md) only after submitting your own design.
