# 40. Capstone: publication-bound response service

This capstone combines publication lineage, response validation, and retry identity into a proposed service contract. The starting implementation is [app.ts](../../apps/api/src/app.ts), backed by [publications.ts](../../packages/data/src/publications.ts) and [submissions.ts](../../packages/data/src/submissions.ts). Your deliverable is a coherent design and evidence package, not an instruction to modify the live application or install infrastructure. Guidance appears in the [separate review](review-13-models-and-adapter-evidence.md).

## The concrete problem

A respondent loads a form, spends time answering it, and submits after the owner republishes the slug. The response contract must not silently change under the respondent. A lost response must also be recoverable without creating a second logical submission or returning success for a changed payload under the same operation identity.

The current route resolves the latest slug publication at submission time, validates against it, and deduplicates under that publication ID. The capstone proposal should address this race while preserving immutable publication history and clear slug ownership. It should not require freezing all publication activity while a respondent has the page open.

Choose one of two policies: publication-bound sessions that can submit to the loaded snapshot under an explicit availability rule, or latest-only sessions that receive a structured mismatch requiring review. Both can be coherent. The grading criterion is whether the client and server agree about interpretation and recovery, not whether one policy is universally preferred.

## Define the protocol artifacts

Specify a load response containing the publication identity and schema contract needed by the renderer. If rules or flow are included, version them with the publication rather than reading mutable defaults later. Define the submission request's operation key, publication binding, and answer representation. Define success, duplicate, payload mismatch, publication unavailable, validation failure, and uncertain transport handling.

Do not use a request ID as an operation key by accident. The operation key belongs to one logical response attempt and survives transport retries. A deliberately new response gets a new key. If the client edits answers after an uncertain attempt, decide whether it retains the original immutable payload for retry and creates a new deliberate operation for the change, or requires an explicit recovery step before continuing.

The fingerprint policy must define canonical answer equivalence. Include object key ordering, omission, empty strings, booleans, unknown keys, and normalization. A contract that says hash the body without defining which body representation is hashed is incomplete. The stored response should retain the interpreted values associated with the fingerprint so later review can explain what was accepted.

## Define authoritative storage operations

Publication lookup and submission creation need an authority that preserves the selected snapshot. A durable uniqueness rule coordinates publication/key identity. The submission record and retained replay result should commit together under the chosen storage model. If the service emits a business event, its intent belongs in the same transaction or another explicitly recoverable protocol.

Do not solve the capstone by adding an in-memory Map beside a durable submissions table and calling it idempotency. A process restart would lose the replay identity while retaining the effect. Likewise, a receipt stored before the submission can falsely report success after a later failure. The design should draw the transaction boundary and name what happens at every side of it.

Retention is part of the protocol. State how long a client may retry and what happens after replay evidence expires. If the service permanently retains submissions but prunes operation lookup, define whether a later retry can discover its prior result through another index. Do not silently downgrade duplicate protection while keeping the same client promise.

## Required adverse scenarios

First, load P1 and submit successfully without republishing. Second, load P1, publish P2, and submit under the chosen policy. Third, accept P1/K and lose the response, then retry identical answers. Fourth, reuse P1/K with changed answers. Fifth, send two concurrent first attempts with the same scope. Sixth, retry after the supported retention window. Seventh, submit to a publication that has been archived according to a proposed lifecycle rule.

For each scenario, specify stored records, HTTP outcome when observed, client state, and whether a downstream event exists. The lost-response scenario must distinguish server effect from client observation. The concurrent scenario must use independent storage clients in an eventual integration test; sequential calls to a fake repository cannot establish the race guarantee.

Also include a malformed request that fails before repository invocation and a cross-workspace publication ownership conflict. These preserve existing adapter and lineage boundaries while the new response protocol is added. A feature that fixes retry identity but weakens slug ownership or schema validation is not a successful integration.

## Client recovery experience

The client should preserve the respondent's draft during validation or publication mismatch. If a new schema must be reviewed, show which questions changed and avoid silently discarding answers. If the original submission is confirmed through replay, show the retained receipt rather than resubmitting under a fresh key. If the outcome remains unknown, say so and offer the defined recovery action.

Local storage can support recovery but is not the authoritative submission record. A browser restart can restore a pending immutable envelope if the feature explicitly stores it. Storage failure should be visible, and shared-device cleanup should be part of the lifecycle. The current demo public page's fixed receipt is not evidence for this proposed network flow.

Accessibility and progress messaging should follow the same outcome model. A generic success banner must not appear before authoritative acceptance. An error message should distinguish a correctable answer from a publication change or unresolved transport result. The UI can remain simple while the internal categories stay precise.

## Deliverables and scoring

Submit a protocol table, canonicalization specification, storage transaction diagram, eight or more scenario traces, client recovery wireframe descriptions, and a verification plan. If implementing a prototype later, place it in an isolated learner-owned location and preserve the reference application and existing answers. The design should be reviewable before any deployment or data migration.

Allocate thirty points to identity and interpretation, thirty to atomicity and retries, twenty to adverse evidence, and twenty to user recovery and scope discipline. A clear latest-only policy can score as highly as publication-bound sessions if it preserves drafts and avoids silent reinterpretation. Unsupported exactly-once claims lose credit even when the happy path is polished.

## Exercises

**FF-40A, eight points:** Choose the publication policy and define load, submit, and replay artifacts. State the immutable interpretation and operation identity that survive republishing and reconnects.

**FF-40B, six points:** Draw the storage boundary and adverse scenario matrix, including concurrent first attempts and accepted-but-response-lost recovery. Identify the integration evidence needed beyond the pure scope model.

**FF-40C, six points:** Design client recovery for changed schema, changed payload under one key, and expired replay evidence. Preserve respondent work and specify truthful accessible feedback for each outcome.

## Defense prompt

A reviewer changes only one fact: the owner republishes between the retry's first and second network hops. Explain why your interpretation and idempotency scope remain coherent or why the service returns a deliberate conflict. If the answer depends on whichever publication happens to be latest when a helper runs, revisit the protocol before implementing it.
