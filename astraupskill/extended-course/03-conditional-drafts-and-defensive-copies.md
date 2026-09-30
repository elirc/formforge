# 03. Conditional drafts and defensive copies

Conditional writes prevent a stale editor from silently replacing newer accepted work. Defensive copies prevent a caller from mutating stored work through a returned reference. These protections address different failure paths. FormForge's small in-memory draft repository provides a clear example of both, provided we keep its process-local limits explicit.

Read [drafts.ts](../../packages/data/src/drafts.ts) before following the trace. The repository's asynchronous signature can distract from the important ordering: comparison, candidate construction, and map replacement execute without an intervening await inside save. This observation explains this implementation's local behavior. It does not provide a database algorithm for multiple server processes.

## Work the comparison as a precondition

Imagine no draft exists for workspace pine and form intake. Editor A saves with expectedVersion zero and receives version one. Editor B also began from no record and later submits expectedVersion zero. The repository now compares zero with one and returns conflict containing a copy of the current draft. It does not increment the version, replace the schema, or call the clock for a new accepted record on that branch.

Now both editors load version one. A saves a renamed title with expectedVersion one, receiving version two. B tries to change a question using the same expected version. B gets a conflict. The repository cannot tell whether those two edits were semantically compatible; its contract rejects a stale base regardless of whether fields overlap. A three-way merge would need the original base schema, local schema, current server schema, and explicit conflict rules. It is not supplied by the integer comparison.

A tempting client fix is to copy serverVersion into local state and immediately resend B's entire stale schema. That passes the next numerical precondition while potentially discarding A's title. The number protects only callers that use it honestly. A conflict-aware UI must decide whether to reload, compare, merge, or deliberately overwrite after review. Updating the token alone is not conflict resolution.

## Copies isolate ownership

On success, the repository clones input.schema into its stored record and returns another cloned record. find returns a clone. Conflict returns a clone of the current record. These are separate ownership boundaries: input-to-storage, storage-to-success-result, storage-to-read-result, and storage-to-conflict-result.

A strong test mutates each boundary independently. Start with a choice field whose nested options array contains an option labeled Daily. Save it. Change the original input option label to Hourly. Read again and expect Daily. Then mutate the returned saved record's option label and read again. Finally mutate a record obtained through find. Each experiment tests a different alias path; passing one does not establish the others.

Top-level title mutations cannot distinguish structuredClone from a shallow object spread when the title is a primitive value. A nested option is a better discriminator. Conversely, a test that freezes only the top-level object may miss a nested shared array. Select evidence that fails under the plausible wrong implementation, not merely under an obviously broken empty repository.

## The clock is observable but not the authority token

The constructor accepts a clock function. A fixed clock makes timestamps deterministic without sleeping or altering the machine clock. Save uses toISOString on the supplied Date. If your test asserts an exact timestamp, inject that Date rather than relying on wall time and allowing a wide timing tolerance.

Version remains the conflict token even with a fixed clock. Two sequential accepted saves can legitimately share the same updatedAt under your fixture while receiving versions one and two. This makes a useful mutation test: a replacement implementation that compares timestamps instead of versions should fail a scenario with equal timestamps and different accepted states.

## Moving the interface to durable storage

A future database adapter must implement the comparison and accepted write atomically. Reading a row, comparing in application code, then performing an unconditional update admits a race between processes. The adapter needs a conditional update, an appropriate transaction, or another mechanism whose actual database behavior is tested. The interface does not choose that mechanism for you.

For initial creation, the absent-record case matters too. Two writers can both see absence. A uniqueness constraint over workspace/form and a defined handling path for the losing insert are needed if both writers are allowed to race. Do not reduce the whole contract to UPDATE WHERE version equals expected and forget that no row exists on the first save.

The returned conflict record also has a consistency question: which current state should it describe if another write occurs after your failed condition? State the adapter's intended guarantee. It may return the latest read after detecting conflict, which is useful but not necessarily the precise state that caused the first failure. A test and response description should agree on that distinction.

## Incident: the rejected save changed the form

A learner reports a conflict response but later observes a changed option label. First verify that the rejected save did not enter the map replacement branch. Then inspect references held by the caller. If a previous implementation returned the stored nested object, an unrelated UI mutation could change storage without any save call at all. A passing conflict-status assertion would miss this route entirely.

Capture a complete before snapshot, induce the conflict, mutate the conflict result in the test, and read the repository again. Distinguish the rejected write from mutation through an escaped reference. The resulting incident note should explain both the trigger and the ownership boundary that failed.

**FF-03A, eight points:** Trace absent, accepted, stale, and accepted-again saves with a fixed clock. Record every expectedVersion, result version, and retained title. Include one conflict against an absent record using a nonzero expected version.

**FF-03B, six points:** Design four nested mutation tests for input, success result, read result, and conflict result. State which shallow-copy mutation each test detects.

**FF-03C, six points:** Specify a durable adapter contract for two simultaneous initial saves and two updates sharing a version. Identify the database evidence required before claiming cross-process protection.

Use [the review guide](review-01-identity-and-validation.md) after an independent attempt. The next chapter follows [autosave scheduling](04-autosave-has-two-clocks.md).
