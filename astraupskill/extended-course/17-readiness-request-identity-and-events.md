# 17. Readiness, request identity, and operational events

Operational surfaces should answer precise questions. FormForge's API includes liveness, injected dependency readiness, request-id generation, and an optional completion event sink. These features make a good review exercise because each can look like a broader reliability guarantee than the source actually supplies.

Read [app.ts](../../apps/api/src/app.ts), [operational-events.ts](../../apps/api/src/operational-events.ts), and the health/event examples in [app.test.ts](../../apps/api/src/app.test.ts). The objective is to define what an operator can infer from each result and which failures remain outside that observation.

## Liveness and readiness are distinct handlers

The health route returns an ok status and service name. The readiness route awaits an injected readiness function, defaulting to true when none is supplied. False produces 503 with not_ready and a failed dependency check. A thrown or rejected readiness call is caught and produces the same unavailable response.

This distinguishes the API answering a request from its chosen dependencies being ready according to the supplied probe. But the default true probe does not inspect a database, disk, network provider, or repository. A deployed adapter must supply the relevant readiness check if the operator wants that meaning. The presence of a route named ready is not evidence that every dependency was examined.

A proposed database probe should define its scope and cost. Does it establish connectivity, schema compatibility, permission to read, or ability to commit a write? Those are different claims. A frequent probe that mutates production data can create unnecessary work, while a superficial connection check may miss a migration mismatch. Choose the requirement before implementation.

## Request ids are correlation data

The API accepts x-request-id when it is a string matching one to one hundred allowed letters, digits, dots, underscores, colons, or hyphens. Otherwise it generates a random UUID. This bounds the accepted format but does not make a caller-supplied id globally unique or trusted proof of identity.

Two requests can intentionally supply the same accepted id. That may be useful for external correlation or confusing if a logging system assumes one id always means one request. A proposal can retain a separate internal unique request id and an external correlation id, but that is not the current single-field contract. Do not use requestId as a submission idempotency key without an explicit relationship.

The route value in the completion event comes from request.routeOptions.url or unmatched. That tends to describe the route template rather than the full raw URL with every parameter or query. This is useful for grouping events and limiting accidental exposure of user text, but exact framework behavior should be verified at the injected-request boundary for the routes you rely on.

## Completion events are narrow records

The onResponse hook calls the optional sink with timestamp, level, fixed event name, request id, method, route, status code, and rounded elapsed duration. Statuses at least 500 are error, at least 400 are warn, and lower statuses info. The timestamp uses the injected now function, making a focused test deterministic.

The event type does not include request body, answers, schema, or raw query text. That is a meaningful scope choice. The existing test checks a health event and serializes it. Broader privacy claims need cases containing distinctive secret-like synthetic strings in request bodies and URLs, plus assertions against the emitted record. Never use real secrets as test markers.

The sink type returns void, and the hook directly invokes it. The code does not show a durable event queue, retry mechanism, or explicit isolation catch around sink failures. A successful event callback in one test does not establish lossless telemetry or that a failing sink cannot affect framework processing. A proposal should decide whether telemetry failure is best-effort, buffered, or request-affecting and test the chosen policy.

## Durations need a boundary definition

reply.elapsedTime is rounded for the event. That records a framework response-duration observation. It is not automatically database time, time to durable client receipt, or end-user perceived completion across rendering. A dashboard that labels it save latency should justify the label and separate route processing from browser work.

Rounding also affects very short operations. A zero duration in the event can mean the rounded measurement was small, not that no work occurred. For a performance investigation, preserve raw higher-resolution measurements at the appropriate layer if necessary, while avoiding expensive per-request detail without a purpose.

## Incident: healthy process, unavailable editor

An operator sees health ok while draft saves fail. The first question is which probe was called and which readiness implementation was injected. A process can answer liveness while storage is unavailable. If readiness defaults true, even ready can remain green without checking storage. The incident note should identify probe semantics before accusing the dashboard of contradiction.

A useful improvement introduces a deterministic failing readiness fixture, a dependency-specific result that avoids leaking internals, and documentation mapping probe failure to operator action. It should not make every transient downstream fluctuation restart the process unless that is the intended orchestration policy. Readiness routing and process lifecycle are separate design decisions.

**FF-17A, eight points:** Trace readiness true, false, synchronous throw, and rejected promise. Compare each with the liveness route and state what the default probe establishes.

**FF-17B, six points:** Build a request-id table for accepted, oversized, invalid-character, repeated, and missing values. Explain why correlation identity is not authorization or idempotency.

**FF-17C, six points:** Design a synthetic payload-omission test and a failing-sink experiment. Specify a proposed telemetry reliability policy without claiming the current optional callback is a durable queue.

Use [the separate review](review-07-models-operations-and-api-tests.md), then continue to [API test evidence](18-injected-api-tests-and-adapter-contracts.md).
