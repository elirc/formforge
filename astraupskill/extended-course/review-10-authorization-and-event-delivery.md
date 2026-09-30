# Review 10. Authorization and event delivery

Chapters 27 and 28 describe production-oriented proposals around a learning application. The current header comparison is not authentication, and the operational event sink is not an outbox. Keep those facts explicit while grading the designs.

## FF-27A: identity and capability

The route workspace and form identify resources. An authenticated actor must come from a trusted identity boundary. The current publication handler compares x-workspace-id to the route workspace, while draft GET and PUT do not show that comparison. A production matrix should assign capabilities for draft access, save, publish, historical data, comments, export, and analytics, marking nonexistent endpoints as proposed surfaces.

Award three points for the identities, three for a useful capability matrix, and two for current-source accuracy. Copying a caller-supplied workspace header into every route is not a complete membership system. Public respondent access also needs its own policy rather than inheriting workspace editor permissions.

## FF-27B: authority timing

The proposed sequence should reject unauthenticated or unauthorized work before persistence, with a consistent disclosure policy for private resources. Tests can assert that injected repositories were not called after an early denial. An in-flight save racing with revocation requires an explicit authority point or consistency rule; request admission alone is not automatically a permanent grant.

Award two points for ordering and disclosure, two for repository-call evidence, and two for revocation semantics. These adapter tests do not prove a real identity provider or membership database works. A stronger integration requires evidence across those boundaries.

## FF-27C: tenant isolation

Two workspaces sharing a form ID expose missing tenant predicates that globally unique fixture IDs can hide. Reads, writes, uniqueness constraints, and background job scope should all preserve workspace identity. An export job needs trusted creation context and a defined reauthorization policy, not an indefinitely trusted copied header. Cached permissions require a stale-lifetime and invalidation policy.

Award two points for the fixture, two for background authority, and two for cache/revocation behavior. A workspace column in a table does not ensure every query uses it. The evidence should inspect actual scoped access, not only the schema definition.

## FF-28A: facts and observations

HTTP completion describes one request, including duplicates and failures. Submission-created describes one authoritative business effect. Storing then notifying can lose a notification; notifying then storing can announce nonexistent data. A proposed transaction commits the submission and event intent together, with a stable event ID and enough publication/submission identity for interpretation.

Award three points for the distinction, three for the two failure traces, and two for atomic intent and payload scope. The existing direct operational sink does not provide durable business delivery. Keep respondent content out of event payloads unless the design has a justified bounded need.

## FF-28B: worker and consumer uncertainty

After send but before completion recording, a crashed worker can cause redelivery. Stable event identity lets a capable consumer suppress duplicate effects. Leases coordinate worker claims but do not eliminate overlap after expiry. Retry policy should distinguish transient failures from permanent or unsupported events and expose unresolved dead-letter work.

Award two points for the crash trace, two for identity and lease limits, and two for retry/consumer handling. Exactly-once downstream effects require a specific mechanism at that boundary; a unique outbox row alone is insufficient. A consumer aggregate update and processed-event marker also need atomic coordination.

## FF-28C: complete identity chain

The producer model permits submission and intent together or neither under its transaction contract. Delivery attempts can repeat, and completion may lag. A consumer processed-event set prevents repeated modeled effects only when coordinated with those effects. Duplicate HTTP requests should recover the original submission and event rather than create new intents. If republishing changes the submission scope, the outbox will faithfully deliver the resulting new effect unless the upstream identity policy prevents it.

Award two points for producer states, two for consumer atomicity, and two for duplicate and publication-scope reasoning. The model teaches phase relationships; it does not establish real provider delivery, database transaction behavior, or operational retention. A complete proposal lists those remaining evidence requirements.
