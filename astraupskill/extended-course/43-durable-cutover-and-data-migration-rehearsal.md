# 43. Durable cutover and data migration rehearsal

Moving from in-memory repositories to durable storage changes operational assumptions as well as code. This chapter designs a rehearsal for that transition using the contracts in [drafts.ts](../../packages/data/src/drafts.ts), [publications.ts](../../packages/data/src/publications.ts), and [submissions.ts](../../packages/data/src/submissions.ts). It does not perform a migration or access production data. The [review](review-14-operational-capstones.md) evaluates the plan.

## Identify what currently survives

Each in-memory repository owns process-local maps and, for submissions, a local sequence. A process restart does not preserve those maps by itself. A durable adapter changes that lifetime, but a migration plan must first identify where any data to migrate actually comes from: synthetic seed fixtures, an exported process snapshot, or an external source. Do not claim to migrate historical records that were never retained.

For a rehearsal, use a declared synthetic dataset with two workspaces, duplicate local form IDs across workspaces, multiple publication slugs for one form, historical snapshots, and repeated submission keys under different publications. This dataset exercises the identities the durable schema must preserve. A single workspace with one form and one response hides many mapping mistakes.

Record source provenance and hashes for exported files if files are used. Do not put real respondent values into routine migration logs. The manifest should identify record counts, identity mappings, validation failures, and target constraints. The rehearsal's purpose is to prove the transformation contract on owned data, not to normalize away every awkward input.

## Preserve relational meaning

Drafts are keyed by workspace/form and carry their own optimistic version. Publications have immutable IDs, per-form version lineage, and slug ownership. Submissions refer to publication IDs and idempotency keys. A migration must preserve those references or create an explicit mapping applied consistently to every dependent record.

If publication IDs change, submission references must be translated through a recorded one-to-one mapping. If a mapping is missing or ambiguous, stop rather than attaching the response to the latest publication with the same form ID. That shortcut can make all foreign keys valid while changing the meaning of the answers.

Slug reservations must be reconstructed from actual ownership, not whichever snapshot is inserted last. A form can have several slugs and each slug several snapshots. Per-form versions span those slugs. A target schema with unique snapshot slug or version scoped only by slug would distort the current contract even if every insert succeeds.

## Validation versus repair

Separate records that are valid under the source contract, invalid due to corruption, and unsupported because the target adds a new requirement. A migration can define a deterministic transformation for supported changes. It should not silently invent missing publication identity, answer meaning, or historical timestamps.

If the target requires a field absent from old data, use an explicit unknown/imported representation or a reviewed mapping. For example, an actor identity cannot be reconstructed from a workspace header alone. A migration operator is not automatically the historical author. Preserve uncertainty in the data rather than manufacturing plausible values to satisfy a non-null column.

Repair can be a separate reviewed operation with before/after evidence. The rehearsal should demonstrate that invalid records remain preserved and reported, not discarded because the target import rejected them. A count mismatch needs explanation at the record level, not a note that a few rows were skipped.

## Cutover authority

Choose a cutover strategy appropriate to the application. A simple maintenance window can stop writes, export the authoritative source, transform and validate it, switch adapters, and reopen traffic. A live dual-write strategy is more complex because two authorities can disagree and retries can partially succeed. Do not select dual writes merely to avoid a short pause without designing reconciliation.

During cutover, define which system assigns new draft versions, publication versions, and submission IDs. Overlapping old and new writers can create collisions or accept changes that never reach the selected target. A readiness gate can keep the new service out of traffic until validation completes, but its probe must test the actual required capability rather than the default true function.

If using an export snapshot from a running process, identify how it is made consistent across repositories. Reading drafts, publications, and submissions independently while writes continue can produce a combination that never existed at one point in time. The rehearsal should either fence writes or define a consistent snapshot mechanism.

## Rollback after new writes

Before reopening traffic, rollback can often restore the old configuration and source snapshot. After the new system accepts writes, rollback is harder. Returning to the old snapshot can lose those accepted drafts, publications, or responses. A plan must capture and translate post-cutover changes or explicitly choose a read-only validation period that avoids them.

Do not claim that retaining a backup makes rollback lossless. A backup is a recovery point, not a record of every later accepted effect. The rollback decision should state its data-loss tolerance, required reconciliation, and authority fence. If a reverse transformation is lossy, document that limitation before deployment rather than discovering it during an incident.

The rehearsal can simulate one post-cutover draft save, one publication, and one submission, then attempt the planned rollback process on synthetic data. Verify that their identities and meanings survive or that the plan correctly refuses a lossless-rollback claim. This is more informative than testing only an empty database migration.

## Acceptance evidence

Compare counts by entity and scope, verify every submission's publication reference, check slug ownership, preserve per-form version order, and confirm draft expected-version behavior with two independent clients in the target integration. Compare schema and answer semantics, not only row counts. A migration can preserve counts while swapping two publication references.

Also test copy isolation and runtime parsing at the new adapter boundary. Durable storage does not automatically guarantee callers receive detached domain objects. Verify timestamps and ID allocation under restart. If the target uses a database-generated sequence, explain how imported IDs coexist with future allocation.

Keep cleanup ownership explicit. A rehearsal database or directory must be unmistakably isolated and named by the operator or harness. No exercise should issue a broad deletion against a computed path or a shared database. The written plan can include cleanup criteria without executing them.

## Exercises

**FF-43A, eight points:** Define the synthetic migration dataset and identity/reference manifest. Explain how drafts, publication lineage, slug reservations, and submission replay scope are preserved.

**FF-43B, six points:** Separate validation, deterministic transformation, and repair. Design a write fence and consistent cutover snapshot, including readiness behavior and ID allocation ownership.

**FF-43C, six points:** Rehearse rollback after three post-cutover effects and specify acceptance checks beyond counts. State the owned environment and cleanup limits without performing a live migration.

## Exit evidence

A migration succeeds when the new system preserves the meaning and authority of accepted data, not merely when an import command exits successfully. The rehearsal should make failure visible before cutover and make rollback's limits explicit before users depend on the new store.
