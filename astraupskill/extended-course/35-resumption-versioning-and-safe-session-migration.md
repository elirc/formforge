# 35. Resumption versioning and safe session migration

Local resumption makes a form feel forgiving, but a stored session can outlive the schema and flow that gave it meaning. The current [resumeSession](../../packages/core/src/flow.ts) validates selected structural properties without binding the session to a publication version. [MultiPageForm.tsx](../../apps/web/src/MultiPageForm.tsx) stores the serialized session under a configurable browser key. This chapter designs a proposed versioned envelope and migration policy. Answers are in the [workflow review](review-12-journeys-flows-and-query-snapshots.md).

## What the current parser establishes

The parser accepts JSON objects with a current page ID that exists in the supplied flow, a nonempty visited-page array whose IDs all exist, a boolean completed flag, and an answers object whose values are undefined, string, or boolean. It returns those fields in a new session object. It does not verify that currentPageId equals the history tail, that the history is a legal route through the flow, or that answer keys belong to the schema.

It also does not carry a schema or publication identity in the serialized session. If a new flow reuses the same page IDs, old history can pass the structural checks even though branch conditions or field meanings changed. Conversely, renaming a page ID can cause an otherwise recoverable draft to be rejected and replaced by a fresh session in the current loader.

These facts define a useful minimal parser, not a complete migration engine. A stronger proposal should preserve recoverable respondent work while refusing to claim that every structurally accepted object is semantically valid for the latest publication. Validation and migration have different responsibilities: one checks a representation against a contract, while the other transforms between contracts with documented meaning.

## Design the envelope

A proposed stored envelope can contain format version, publication ID, flow version, journey ID, savedAt, and the session payload. The format version describes serialization shape. Publication and flow identities describe interpretation. Journey identity supports telemetry and resume semantics. savedAt helps present age but should not become the sole authority for ordering if clocks can change.

The browser storage key should include enough scope to avoid mixing different forms, workspaces where relevant, and publication sessions. Do not rely only on a human-readable slug if it can point to a new publication later. At the same time, a product may intentionally discover an older draft under the same slug and offer migration. That discovery should be separate from silently treating the old draft as current.

Store only the data needed for resumption and handle storage failures explicitly. Sensitive answers in browser storage require a deliberate product policy and lifecycle, especially on shared devices. The course does not prescribe a legal retention rule; it asks the implementation to expose a clear reset/delete action and avoid retaining abandoned drafts indefinitely by accident.

## Classify compatibility before migrating

Some changes are compatible: a descriptive text correction may leave field and page identities intact. Some require a mapping: a page ID rename can preserve the same logical page if the publication author declares it. Some are incompatible: reusing a field ID for a different question or changing a choice's meaning cannot be repaired by copying the old value unchanged.

The migration should use an explicit mapping associated with source and target versions. It should not guess based on similar labels or array positions. Labels can be translated, duplicated, or edited; positions can change through reordering. A mapping can preserve answer values, rename stable identities, or mark an answer unresolved, but it must retain enough provenance for the respondent to review what happened.

For incompatible changes, offer a choice such as continue the old publication if allowed, start the new form while retaining an export of old answers, or review a partially migrated draft. Avoid discarding the old storage record before the user has a recoverable path. A failed migration should leave the source evidence intact.

## History migration is not just ID replacement

Suppose a stored path is contact, role, technical, review. The new flow removes technical and changes the branch from role. Replacing or deleting IDs in the history may produce a sequence that never existed under either flow. The migration must decide the new current position and eligibility of retained answers, not merely make every ID pass the existence check.

A conservative policy can return the respondent to the earliest affected page with answers preserved as draft data and require revalidation of the remaining route. This can be more honest than claiming the session is still completed under a new flow. A completed local session from the old publication should not automatically become a server-accepted response under the new one.

The current completed flag is a local navigation state. If a production system also tracks submission acceptance, store that separately with a receipt or submission ID. Migrating the navigation envelope must not fabricate or erase the business submission's identity. The previous chapter's telemetry distinction applies here as well.

## Atomic local replacement

A migration can fail during parsing, mapping, serialization, or storage write. Preserve the original record until the new envelope is successfully stored and validated under the chosen browser-storage mechanism. If multiple tabs can write the same key, define a conflict policy; a last write can otherwise replace a newer draft with a migrated older one.

Browser storage events can notify other tabs of changes, but notification alone is not a transaction or conflict-resolution policy. A proposed revision token can detect some overwrites, while a stronger browser database transaction can coordinate a local record update. The design must match the actual storage API's guarantees rather than borrowing assumptions from the in-memory reducer.

For a teaching lab, use an in-memory storage adapter that can fail each operation and record exact keys. This verifies the migration algorithm's preservation rules without touching real browser data. A later browser test can characterize quota and cross-tab behavior, but the pure adapter's green result should not be reported as proof of those platform properties.

## Exercises

**FF-35A, eight points:** List the current parser's checks and missing semantic bindings. Design a versioned envelope and key scope that distinguishes format, publication, flow, and journey identity.

**FF-35B, six points:** Classify three schema/flow changes as compatible, mapped, or incompatible. Migrate the technical-page removal example without claiming a fabricated legal history or accepted submission.

**FF-35C, six points:** Design a failure-injected local migration adapter that preserves the original record. Include concurrent-tab policy, storage-write failure, and a respondent review path for unresolved answers.

## Exit evidence

Resumption should preserve work without silently changing its meaning. A versioned envelope makes interpretation explicit, and a migration contract explains which parts survive, which need review, and which cannot be inferred. The safest recovery is often a clearly marked partial draft rather than a confidently completed session based on obsolete assumptions.
