# 33. Journey telemetry and late-arriving events

The analytics core consumes already assembled ResponseJourney records. It does not collect browser events, deduplicate starts, or reconcile completion with stored submissions. This chapter designs that missing ingestion boundary as a proposal. Use [analytics.ts](../../packages/core/src/analytics.ts), [MultiPageForm.tsx](../../apps/web/src/MultiPageForm.tsx), and [flow.ts](../../packages/core/src/flow.ts) to distinguish current local transitions from future telemetry. Answers are in the [workflow review](review-12-journeys-flows-and-query-snapshots.md).

## A journey row is a projection

ResponseJourney contains ID, startedAt, optional completedAt, and lastPageId. The report counts rows as starts without deduplicating IDs. Therefore, a producer that emits duplicate journey rows inflates starts and can change completion rate. The analytics function assumes its input population is already the intended set of journeys; it is not an event-ingestion engine.

A proposed pipeline can receive events such as journey_started, page_entered, and submission_accepted, then build one journey projection per identity. The event identity and journey identity have different roles. One journey can contain many events, and one event can be delivered more than once. Deduplicating only journey IDs would discard legitimate page transitions; deduplicating nothing would replay effects.

Define whether a journey means one browser session, one response attempt, or one respondent's entire interaction across devices. The answer changes how resume and Start over behave. The current local session has no journey ID field, so adding telemetry requires a deliberate identity extension rather than inferring identity from the form ID or browser storage key.

## Completion needs an authority

The multi-page demo marks completed when nextSession reaches a null target and displays a local completion screen. That is not the same event as the public API accepting a submission. A future analytics system should choose whether completion means navigation completed, local answers stored, or server submission accepted. These are valid but distinct measures.

For a response-conversion metric, server acceptance is often the stronger authority. The browser can still record navigation completion as a separate event to diagnose abandonment between review and submit. If both are stored under one completed flag, the report cannot distinguish a respondent who finished the questions but failed to submit from one whose response was accepted.

The event should reference the publication contract and, when accepted, the submission ID. This connects telemetry to authoritative data without requiring raw answers in every event. A missing telemetry completion should not cause a stored submission to disappear from business reports. Reconciliation can compare the two populations and expose ingestion gaps.

## Out-of-order delivery

Imagine page-entered event P2 arrives before journey-started, followed by a duplicate P2, then completion, then a delayed P1. A naive projection that always sets lastPageId from the most recently received event can move the completed journey backward to P1. Arrival order is not necessarily interaction order.

A proposed event envelope can include a per-journey sequence or another ordering token, plus event time and receive time. Sequence requires an owner and reset policy; multiple devices or tabs complicate a single counter. Event time alone can be affected by clock skew. The design must choose a coherent ordering rule and retain enough evidence to diagnose rejected or late events.

For a single-browser journey model, a monotonic local sequence can order page transitions while the server records receive time. Completion can be terminal under the chosen projection policy, so older page events do not overwrite it. A deliberate restart or new response attempt should create a new journey identity rather than silently reopening a terminal record. If the product permits reopening, represent it as an explicit transition with its own rules.

## Drop-off is inferred, not immediately observed

An incomplete journey's last page is not automatically a confirmed abandonment. The respondent may be paused, offline, or planning to resume. A report that calls every incomplete row a drop-off is using a particular observation window. The current core does exactly that for its supplied records; a production pipeline should define when a journey becomes eligible for abandonment analysis.

A proposed report can use an inactivity threshold and an as-of time, or distinguish active, paused, abandoned, and completed states. The threshold should be configurable and documented because it affects rates. A late completion can revise an earlier abandonment classification, so historical reports need either restatement semantics or a fixed snapshot policy.

This is not an invitation to infer sensitive respondent intent. The system observes events and time gaps, not reasons for leaving. Labels such as confused or uninterested require evidence beyond telemetry. A good dashboard says last observed on page X within the declared window rather than presenting an inferred motive as fact.

## Privacy and minimum event payloads

Journey events usually need identity, publication, page, sequence, and time information. They do not necessarily need the answers themselves. Avoid copying email addresses or free-text responses into telemetry merely because the browser has them available. A stable pseudonymous journey ID can support flow analysis without exposing respondent content in operational streams.

If a diagnostic requires a rule outcome, record a bounded category or branch identifier rather than the raw answer that triggered it where possible. The publication snapshot can explain the branch definition. Retention and access policies should match the sensitivity of the event stream, and exports should not quietly join it with identifying data unless authorized by the product's declared purpose.

The course does not prescribe a legal policy. It teaches data minimization as an engineering choice: retain the facts necessary to answer the intended question, and avoid creating another uncontrolled copy of response content. A telemetry pipeline can be useful without becoming a shadow submission database.

## Exercises

**FF-33A, eight points:** Define journey and event identities and a projection schema. Explain how duplicate rows affect the current report and distinguish navigation completion from authoritative submission acceptance.

**FF-33B, six points:** Process the P2, duplicate P2, completion, delayed P1 schedule. Specify ordering, terminal-state, and late-event rules, including the assumptions that make a per-journey sequence valid.

**FF-33C, six points:** Define a drop-off observation window and reconciliation report for submissions missing telemetry. Minimize event payloads and avoid inferring respondent motives from inactivity.

## Exit evidence

A trustworthy journey report begins before the analytics function. Its ingestion contract establishes identity, order, completeness, and observation time. Without that contract, a precise median or percentage can summarize duplicated or misordered events with misleading confidence.
