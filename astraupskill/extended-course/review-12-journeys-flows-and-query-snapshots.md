# Review 12. Journeys, flows, and query snapshots

These answers cover chapters 33 through 36. They assess the contracts required between current pure helpers and future durable or remote adapters. The current code does not implement event ingestion, a complete static flow validator, versioned session migration, or remote snapshot cursors. A proposal earns credit by naming those boundaries and preserving useful existing behavior.

## FF-33A: event and journey identities

One journey contains many events, while one event may be delivered repeatedly. A projection needs both identities and duplicate-event handling. The current report counts every supplied journey row, so duplicate rows inflate starts. Navigation completion in the local flow differs from authoritative submission acceptance; a production conversion metric should choose its completion authority and retain separate events when both are useful.

Award three points for identity, three for projection/count behavior, and two for completion authority. A form ID or storage key is not automatically a journey identity. Start over, resume, multiple tabs, and multiple devices require an explicit attempt/session policy.

## FF-33B: late events

A coherent single-browser proposal can use per-journey sequence numbers, deduplicate event IDs, and prevent older page transitions from overwriting a terminal completion projection. P2 can be retained pending or used to create a partial projection according to the policy; its duplicate has no new effect. The delayed P1 must not move the completed journey backward merely because it arrived last.

Award two points for the schedule, two for ordering and terminal rules, and two for assumptions. A per-journey counter needs one owner or a multi-writer strategy. Client timestamps alone do not establish reliable order under clock skew, and receive order does not equal interaction order.

## FF-33C: observed abandonment

The proposed report should name an inactivity threshold and as-of time or distinguish active from abandoned journeys. Late completion can revise earlier classifications unless reports are explicitly frozen. Reconciliation compares accepted submissions with telemetry identities and exposes missing events without removing authoritative responses. Event payloads can carry publication, page, sequence, and identity without copying answers.

Award two points for the observation window, two for reconciliation, and two for minimization and avoiding motive inference. Inactivity does not prove confusion or disinterest. The current core's incomplete-row calculation is a defined input operation, not a complete behavioral explanation.

## FF-34A: ordered decisions

Engineering satisfies both not-design and equals-engineering in the example, so the first matching branch wins. Reordering changes the target. Structural checks should cover empty flows, duplicate pages, unknown sources/targets, and field membership according to policy. Page rendering currently follows schema field order because it filters schema.fields, rather than honoring the order of page.fieldIds.

Award three points for branch priority, three for structural validation, and two for field ordering. A graph edge set loses priority information. A validator that only checks targets exist cannot establish that the intended branch is reachable under overlapping conditions.

## FF-34B: reachability and termination

Structural reachability follows possible edges without proving conditions. Feasible reachability asks whether valid answers can actually select a path under ordered branches. Termination asks whether allowed transitions can continue indefinitely. Finite choice domains can support bounded enumeration, while unrestricted values require limited analysis or explicit warnings.

Award two points for each distinction and its analysis limits. A graph cycle is not automatically a reachable infinite respondent path, but the current runtime also does not impose a navigation-length cap. The proposal must state whether cycles are forbidden, controlled, or allowed with a recovery policy.

## FF-34C: retained answers and progress

Backtracking retains answers. After changing role to design, technical answers can remain even though the effective path skips that page. A coherent policy preserves them as inactive draft data while excluding or labeling them in final eligible answers. Immediate deletion may destroy work the respondent expects to recover after another branch change.

Award three points for answer retention and final eligibility, and three for honest progress wording. Array position out of total pages is not necessarily remaining work when branches skip or terminate early. The Continue label can precede completion under the current branch logic; that is a presentation contract to improve, not evidence of an incorrect target.

## FF-35A: stored-session contract

The current parser checks existing current/history page IDs, nonempty history, completed boolean, and permitted answer value types. It does not bind a publication or flow version, prove a legal path, require current to equal history tail, or restrict answer keys to the schema. A proposed envelope separates serialization format from publication/flow interpretation and journey identity.

Award four points for current checks and omissions, two for the envelope, and two for scoped key design. A slug alone can point to a different publication later. Discovering an old draft and deciding whether to migrate it should be separate from silently treating it as current.

## FF-35B: semantic migration

A description correction can be compatible, an explicit page-ID rename can be mapped, and a reused field ID with changed meaning can be incompatible. Removing technical from a stored path requires a new current-position policy, perhaps returning to the earliest affected page while preserving answers for review. Merely deleting IDs can manufacture a history that was never valid.

Award two points for compatibility categories, two for the path policy, and two for preserving meaning and submission identity. A local completed flag does not prove server acceptance. Migration must not turn it into an authoritative submission receipt or erase an existing receipt without policy.

## FF-35C: preservation under failure

The adapter should keep the original record until the new envelope is written and validated, use explicit source/target identities, and report unresolved answers. Inject parsing, mapping, serialization, and write failures. A concurrent-tab policy needs revision detection or storage coordination; browser storage notifications alone are not a transaction.

Award two points for failure preservation, two for concurrency, and two for respondent review and evidence limits. A pure adapter verifies algorithmic decisions, while quota and cross-tab platform behavior require browser evidence. No experiment should mutate real respondent storage.

## FF-36A: remote continuation

The answer must choose a live or snapshot promise, define an immutable total order with a tie-breaker, and specify deleted-anchor behavior. The current helper searches for an exact anchor and restarts at the beginning when absent. A remote keyset predicate or snapshot token has different semantics and should not be described as identical merely because both use a cursor string.

Award three points for browsing semantics, three for ordering/continuation, and two for the local comparison. Timestamp-only continuation is insufficient when records share timestamps. Database collation and mutable ordering fields also need explicit treatment.

## FF-36B: query identity and authority

The cursor should bind or reference filter, sort, version, and snapshot scope as required. Total must describe the filtered authorized population, with exact versus estimated semantics stated. Separate count and page reads can disagree without a snapshot. Cursor redemption still checks authorization, including workspace scope and revoked access; a signature prevents some tampering but does not grant permission.

Award two points for query scope, two for total consistency, and two for expiry and authority. An invalid or expired cursor should trigger a defined reset path rather than silently mixing old pages with a new first page.

## FF-36C: evidence layers

The model should include equal timestamps, a new insertion, anchor deletion, filter change, and cross-workspace or opposite-sort cursor misuse. It can prove its own ordering policy. A database test must separately establish collation, isolation, query behavior, and performance. On expiry, the client should replace or clearly restart the result set under the preserved filter rather than append an unrelated population.

Award three points for adverse cases, two for evidence separation, and one for client recovery. A strong answer can explain what users see after each mutation and why that behavior follows the chosen contract rather than accidental array operations.

## Final workflow defense

Follow one respondent from a resumed local draft through a changed branch, accepted submission, delayed telemetry, and a paged response report. Name every identity and observation boundary. The exercise is complete when the same response remains interpretable even though navigation, event arrival, and report viewing occur at different times. That is the purpose of versioned workflows and query snapshots: preserving meaning across asynchronous lifetimes.
