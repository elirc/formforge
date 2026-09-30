# 28. Submission events and transactional outbox design

The current submission repository stores a response and returns a record. It does not send email, enqueue analytics work, or implement a transactional outbox. This chapter designs a proposed event-delivery extension grounded in [submissions.ts](../../packages/data/src/submissions.ts), the HTTP completion event hook in [app.ts](../../apps/api/src/app.ts), and the operational event type in [operational-events.ts](../../apps/api/src/operational-events.ts). Keep business events and request diagnostics separate. Answers are in the [policy review](review-10-authorization-and-event-delivery.md).

## Business fact versus request observation

An HTTP completion event says a request finished with a status, route, duration, and request ID. A response-submitted event says a particular submission became authoritative. A duplicate retry can produce another successful HTTP completion without creating another submission. A failed response delivery can leave a committed submission even when the request observation appears unsuccessful or incomplete.

Therefore, deriving business notifications directly from every successful request log can produce duplicates or miss accepted work. The proposed event should be tied to the repository's created effect, not merely to status 200 or 201 at an outer adapter. It should identify the immutable submission and publication so consumers can interpret the event without guessing which request caused it.

The existing operational hook calls the optional event sink directly. It is not a durable queue and does not establish reliable business-event delivery. Its payload intentionally avoids response content. A future notification system can reuse some correlation ideas, but it needs a separate acceptance and recovery contract.

## The dual-write problem

Consider storing a submission and then sending an email. If storage succeeds and email sending fails, the response exists but the notification is missing. Reversing the order can send a notification for a submission that later fails to store. Putting both operations in one try block does not make them atomic because they belong to different authorities.

A proposed outbox stores the submission and an event intent in the same durable transaction. A worker later reads pending events and delivers them. This moves uncertainty from whether the intent exists to whether delivery has completed, where retries can be managed explicitly. The design still depends on the transaction actually covering both records; two independent writes labeled outbox do not solve the split.

The event intent can contain a stable event ID, submission ID, publication ID, event type, payload version, creation time, and delivery state. Minimize copied respondent data. A notification consumer can retrieve authorized details when needed, or the event can contain a deliberately bounded snapshot. The choice affects privacy, retention, and resilience when the source record changes or becomes unavailable.

## At-least-once delivery and consumer identity

Suppose a worker sends an event and crashes before recording completion. On restart it may send the same event again. This is a normal at-least-once delivery scenario. The consumer needs an idempotency strategy keyed by event identity if duplicate effects are unacceptable. Marking an event delivered before sending would avoid some duplicates but can lose delivery after a crash, so it is not a general solution.

For email, the downstream provider's idempotency support and retention window matter. If it has no suitable duplicate suppression, the application must choose how much duplication risk is acceptable and what evidence it retains. Do not promise exactly-once email merely because the outbox event has a unique ID. The receiver's effect and acknowledgement are another boundary.

For analytics, a consumer can store processed event IDs with its aggregate update in one transaction. If those writes are separate, a crash can either double-count or skip an event. Again, the same atomicity pattern appears at the consumer. The producer's transaction does not automatically make every downstream materialized view correct.

## Claiming work and retry scheduling

Multiple workers need a way to claim events without all delivering the same pending row at once. A lease or transactional claim can assign temporary ownership, with an expiry for crashed workers. The lease must not be treated as permanent completion. If a slow worker continues after its lease expires and another worker takes over, both can attempt delivery; stable event identity remains necessary.

Retry policy should distinguish transient failures, permanent validation failures, and unsupported event versions. Use bounded backoff and a maximum or explicit dead-letter state appropriate to the service. A dead-letter record is not successful delivery; it is retained unresolved work that needs review. The monitoring surface should show age and count of pending or failed events rather than hiding them behind a healthy API response.

Ordering also needs a decision. If a submission-created event is followed by a correction or deletion event in a future system, consumers may need per-submission order. Global ordering across every workspace is usually a stronger and more expensive requirement. Define the smallest ordering scope that the business rule needs and make out-of-order handling explicit.

## Duplicate HTTP requests should not duplicate intents

The current repository returns duplicate for an existing publication/key. In the proposed durable transaction, that path should recover the original submission and its existing event identity rather than create another notification intent. A uniqueness constraint on the submission operation and a stable event derivation or unique event key can coordinate this behavior.

If the client retries after the publication scope changes, the previous chapter's P1/P2 problem still applies. An outbox cannot repair an ambiguous submission identity. First define which submission is new, then emit its event exactly according to that contract. Event infrastructure magnifies identity mistakes if it faithfully delivers an incorrectly duplicated business effect.

## A delivery-state laboratory

Model four cells: submission committed, outbox intent committed, delivery attempted, completion recorded. The producer transaction permits neither/both for the first two under its chosen contract. The worker can attempt delivery multiple times before completion is recorded. Add a consumer processed-event set to demonstrate how repeated delivery can avoid repeated aggregate effects in the model.

Exercise crashes before producer commit, after commit before worker pickup, after send before completion, and after consumer effect before its processed marker when those are not atomic. The last case should reveal why consumer-side coordination matters. This is a pure reasoning lab unless you explicitly build an isolated adapter; it does not prove a real email provider's behavior.

## Exercises

**FF-28A, eight points:** Distinguish HTTP completion events from submission-created facts and trace the two dual-write orderings. Define the proposed atomic producer transaction and minimal event payload.

**FF-28B, six points:** Trace worker crash after delivery but before completion. Specify event identity, lease behavior, retry policy, and consumer duplicate suppression without claiming unsupported exactly-once delivery.

**FF-28C, six points:** Build the four-cell delivery model and add consumer state. Explain how duplicate HTTP retries avoid duplicate intents and why publication-scoped submission identity must be solved before event delivery can be correct.

## Exit standard

A good outbox design makes unresolved work visible and recoverable. It does not erase uncertainty with a queue name. The producer, worker, and consumer each have an acceptance boundary, and the complete explanation follows event identity across all three.
