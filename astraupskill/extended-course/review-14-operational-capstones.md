# Review 14. Operational capstones

This guide evaluates chapters 41 through 44. The capstones are proposed engineering work and the incidents are synthetic investigations grounded in current source. The assessment rewards preservation of user work, explicit authority, and evidence that can distinguish competing explanations.

## FF-41A: offline ownership

The base schema identifies the server version used to interpret local changes. The local working schema contains the user's current proposal. The remote schema is the latest authoritative observation used for reconciliation. A ledger should distinguish local persistence from server confirmation and preserve immutable pending operations. Latest local request identity and committed server version have different meanings and should survive restart separately.

Award four points for the three copies and their identities, two for ledger states, and two for the two-clock distinction. A single saved boolean cannot explain locally persisted but server-uncertain work. Replacing a pending payload while retaining its operation identity undermines safe replay.

## FF-41B: adverse schedules

Before server contact, locally persisted work can resume without claiming server acceptance. After committed-but-lost response, recovery must consider that the effect already exists. An old conflict must not erase newer local work. Local-storage failure must narrow the recovery promise. A workspace switch requires completion ownership checks. An unsupported ledger format should preserve evidence and offer recovery rather than silently discard it.

Three-way reconciliation compares base/local/remote per meaningful property and treats edit/delete as an explicit identity conflict. The final save uses the remote version reviewed, so another concurrent edit can conflict again. Award three points for schedules, two for merge/deletion policy, and one for the final precondition.

## FF-41C: truthful recovery

The interface should show what is confirmed locally and remotely, preserve the local proposal, and offer deliberate merge or discard actions. Export can help but must label draft versus publication. Pure models test transition policy, browser tests test storage and reload behavior, and durable adapter tests test server concurrency. Their evidence should not be collapsed.

Award two points for messaging, two for preservation, and two for layered verification. Manual conflict resolution can be correct. Automatic overwrite after refreshing the server version is not reconciliation, even if it makes the error disappear.

## FF-42A: immutable export scope

The export specification captures workspace, publication scope, filter, sort, columns/mappings, and snapshot policy at creation. The manifest records that accepted scope, generated time, logical row count, format version, and provenance. A browser page contains only the data loaded into it and cannot establish completeness for all matching server records.

Award four points for specification and manifest, two for historical interpretation, and two for snapshot/count semantics. If the export is intentionally live rather than snapshot-based, that weaker observation interval must be explicit. A precomputed count from another moment is not automatically the artifact's exact population.

## FF-42B: authorization lifetime

Creation checks the actor's capability; the worker receives a bounded trusted scope; download applies the chosen current-access policy. Revocation can cancel pending work, block retrieval, or remove retained artifacts according to policy, but cannot erase copies already downloaded. Job IDs and tokens must not accidentally bypass intended authorization.

Award two points for the three boundaries, two for revocation limits, and two for artifact identity/retention. A copied workspace header is not an enduring authority grant. Sensitive query or respondent content should not appear in filenames or ordinary logs merely for convenience.

## FF-42C: finalized artifacts

The matrix covers immutable query identity despite UI edits, concurrent inserts, partial generation, cancellation near completion, matching and mismatched creation retries, revoked access, and incompatible historical labels. A temporary artifact becomes downloadable only after the declared finalization boundary. Failure cleanup is restricted to owned artifacts and does not make an incomplete file look complete.

Award three points for adverse cases and three for finalization/evidence layers. A state model does not prove database snapshots, and a streaming test does not prove download authorization. Report each boundary separately so the job's complete contract is reviewable.

## FF-43A: migration identity

The synthetic dataset should exercise two workspaces with shared local form IDs, several slugs and snapshots for one form, and repeated keys under different publications. The manifest preserves draft versions, publication IDs or explicit mappings, per-form version lineage, slug ownership, and submission references. A response must not be attached to the latest publication merely because its original reference is missing.

Award four points for the dataset, two for reference mapping, and two for lineage/replay scope. The current repositories are process-local; a plan must identify an actual export or seed source rather than claiming historical persistence that never existed.

## FF-43B: cutover and repair

Validation identifies supported valid inputs, corruption, and new target requirements. Deterministic transformation uses declared mappings; repair is a separate reviewed action. A writer fence or consistent snapshot mechanism prevents mixed-time exports. The target becomes ready only after its required capabilities and imported data are validated, with one authority assigning new identities and versions.

Award two points for the three categories, two for cutover consistency, and two for readiness/allocation ownership. Inventing historical actors or timestamps to satisfy target columns changes meaning. Preserve unknowns or stop for a reviewed mapping.

## FF-43C: rollback after acceptance

Once the new system accepts a draft, publication, or submission, restoring an old snapshot can lose those effects. A lossless rollback needs a captured change stream, reverse mapping, or another defined reconciliation path; alternatively, a read-only validation period can avoid new writes. Verify references, ownership, versions, copy semantics, and restart allocation beyond row counts.

Award two points for post-cutover effects, two for acceptance checks, and two for owned rehearsal/cleanup limits. A backup is a recovery point, not proof that later accepted work survives rollback. The plan should refuse an unsupported lossless claim rather than conceal the gap.

## FF-44A: competing hypotheses

For save status, distinguish the demo callback from a real durable adapter and compare local request identity with server-version evidence. For hidden errors, distinguish an already hidden field at submit from an error created while visible and retained after hiding. The smallest reproductions use distinct schema edits or one conditional field with explicit submit/change order.

Award four points for the two evidence ladders and four for discriminating observations. Repeatedly retrying until the symptom vanishes is not a causal investigation. A source-supported possibility becomes a stronger conclusion only when the relevant schedule and observations are established.

## FF-44B: identity and representation

The duplicate incident requires publication IDs and operation scope, not just matching answers. P1/K and P2/K can both exist under the current contract. The analytics incident requires raw timestamps, eligible duration samples, computed median, and formatted text. Each layer can explain a different symptom. Do not delete submissions or redefine completion merely to produce a cleaner display.

Award three points for each incident's evidence and restraint. Two identical answer objects can represent legitimate distinct respondents. A malformed duration display can be a formatter issue even when the median is valid.

## FF-44C: focused repair

A useful brief states the concrete trigger, before/after behavior, exact changed boundary, regression schedule, adjacent invariant, and remaining limitation. Examples include preserving committed-version advancement while correcting latest-status ownership, preserving visible required validation while pruning stale hidden errors, or preserving core statistics while normalizing duration text.

Award two points for the repair scope, two for meaningful verification, and two for adjacent invariant and uncertainty. Broad unchanged suites are not a substitute for explaining the reproducing scenario. A concise evidence-based handoff is more valuable than a long list of commands without their implications.

## Capstone completion conference

Have a reviewer choose a failure after one successful step: local storage succeeded, server commit succeeded, export bytes were written, or migration cutover completed. Explain what remains authoritative, what the user has observed, and what recovery can safely do next. If the answer depends on an unrecorded assumption, update the design before adding more features. The operational capstones are complete when every accepted effect has a coherent identity and every uncertain observation has a bounded recovery path.
