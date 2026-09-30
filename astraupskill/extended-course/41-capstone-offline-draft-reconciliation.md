# 41. Capstone: offline draft reconciliation

This independent capstone combines autosave scheduling, local persistence, optimistic concurrency, and recovery messaging. The source anchors are [useAutosave.tsx](../../apps/web/src/useAutosave.tsx), [drafts.ts](../../packages/data/src/drafts.ts), and [Resilience.tsx](../../apps/web/src/Resilience.tsx). The current application does not implement the full durable offline ledger proposed here. Your deliverable is a design and bounded prototype plan, with answers and review criteria in [the capstone guide](review-14-operational-capstones.md).

## The incident brief

An editor opens server draft version seven and changes two fields. The browser loses connectivity after one save may have reached the server. Another editor changes the form online. The first browser then closes and later reopens. The team wants to recover the first editor's work without silently overwriting the second editor or pretending that a missing response proves the first save failed.

Begin by drawing three copies: base schema, local working schema, and current server schema. The base is the version against which local work began or was last reconciled. The local schema includes unsent or uncertain changes. The server schema may include the first save, another editor's changes, or both according to actual acceptance order. A single latestSchema variable cannot represent all these roles reliably.

The capstone should preserve those copies and their identities in a proposed local ledger. Do not merely set expectedVersion to whatever GET returns and retry the local schema. That would turn conflict recovery into unconditional replacement of another editor's work. The product needs either an explicit replacement decision or a merge process with field-level conflict evidence.

## Define the ledger states

Represent at least edited in memory, persisted locally, queued for server, in flight, server confirmed, conflict, and uncertain outcome. Some states can be combined in implementation, but the design must preserve the information they represent. A local write can succeed while the network fails; a server write can succeed while its response is lost; a later edit can supersede the UI relevance of an earlier result while that result still advances the committed server version.

The existing autosave hook already demonstrates two clocks: latest local request identity and committed server version. A durable ledger extends that distinction across browser lifetimes. It should store immutable pending operation payloads rather than overwriting one pending slot with every new keystroke. Otherwise, a retry can reuse an identity for different content or lose the base needed to reconcile a conflict.

Choose what happens when local storage fails. The editor can continue in memory with an explicit warning, offer an export, or pause certain risky actions. It must not claim durable local recovery when the write failed. The UI should identify the last confirmed local record and server version separately if that distinction matters to recovery.

## Reconciliation policy

For each field property, compare base, local, and remote values. A property changed only locally can be proposed for carry-forward; one changed only remotely can be accepted from remote; one changed differently on both sides needs a conflict decision. Arrays and identity-bearing collections require more than scalar comparison. Field order, removed fields, duplicated IDs, and nested choice options need explicit policies.

Do not use a generic object spread as a three-way merge. It can overwrite remote fields or preserve invalid combinations. After producing a candidate merged schema, run structural parsing and schema validation before offering publication. The draft repository's save contract can store a parsed but not yet publishable draft according to the API's current distinction, so decide which validation level the reconciliation UI requires at each step.

Deletion deserves a dedicated case. If remote removed a field while local changed its label, automatically restoring the field may reverse an intentional deletion. If local removed a field while remote edited it, silently dropping it loses work. Present these as identity conflicts with enough context for the editor to choose, rather than treating absence as an empty value.

## Required schedules

Schedule one saves locally, fails before any server call, and resumes. Schedule two commits on the server but loses the response, then another editor advances the version. Schedule three receives a conflict for an old request while a newer local edit is waiting. Schedule four encounters local-storage failure after the UI has changed. Schedule five switches workspace/form while an old save completes. Schedule six reloads with a ledger whose format is unsupported.

For each, state what data survives, what the UI says, and what action is permitted next. The workspace/form switch must not apply an old completion to the new draft's status. The unsupported ledger must preserve recoverable evidence rather than silently deleting it. The conflict schedule must not let an obsolete error hide newer work or let a stale success mark the entire current draft saved.

Use explicit event order in a pure model first. A future browser integration can then test actual storage failure and reload behavior. A durable adapter test can establish server compare-and-swap under independent clients. Keep the prototype's evidence report layered so a successful state model is not mistaken for a tested offline browser product.

## Recovery interface

The recovery view should show a concise explanation, the base version, the current server version, and the local changes needing review. It should preserve the local copy until the user completes or explicitly discards recovery. An export action can provide an additional safeguard, but it should label whether it contains a schema draft or an accepted publication.

For conflicts, present field identity and meaningful labels while avoiding dependence on labels as keys. If a field was renamed on one side, the stable ID helps explain that it is the same logical field. For a removed field, show its base definition so the editor can understand what would be restored or discarded. A text-only diff of serialized JSON can help debugging but may be too noisy for the product workflow.

After a merge decision, save conditionally against the remote version used for review. A new conflict can occur if another editor changes the draft during the review. Preserve the candidate and repeat the process rather than forcing success by dropping the precondition. The interface should make this possibility understandable without blaming the user for normal concurrency.

## Deliverables and scoring

Submit the ledger schema, transition table, six schedules, merge policy for scalar and identity-bearing fields, recovery interface description, and evidence plan. A runnable model is optional but should be isolated and use synthetic schemas. No application source, dependencies, or live browser storage should be changed as part of this written capstone.

Score thirty points for identity and state ownership, thirty for conflict preservation, twenty for adverse schedules, and twenty for truthful recovery messaging. A solution that discards local work on every conflict fails the central objective. A solution that preserves work but openly requires manual resolution can be correct; automatic merging is valuable only when its assumptions are explicit.

## Exercises

**FF-41A, eight points:** Define base/local/remote identity and ledger states. Explain how latest local request and committed server version survive a browser restart without being collapsed into one saved flag.

**FF-41B, six points:** Complete the six schedules and three-way field policies, including edit/delete conflicts and a workspace switch. Name the authoritative precondition on the final reconciled save.

**FF-41C, six points:** Design recovery feedback and an evidence plan that separates pure model, browser storage, and durable server tests. Preserve the local copy until an explicit successful or discard outcome.
