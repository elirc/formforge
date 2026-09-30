# 32. Readiness, observability, and failure isolation

The API exposes health and readiness routes and an optional completion-event sink. These are small operational surfaces with important semantics. Read the hooks and route definitions in [app.ts](../../apps/api/src/app.ts), the [event interface](../../apps/api/src/operational-events.ts), and the relevant [API tests](../../apps/api/src/app.test.ts). This chapter develops a proposed operational contract without claiming the demo's default readiness proves database availability. Answers are in the [presentation review](review-11-presentation-and-recovery-evidence.md).

## Health and readiness answer different questions

The health route returns an affirmative service response. The readiness route awaits an injected readiness function, defaulting to true. A false result or thrown failure produces a not-ready response with dependency failure information. This gives tests and future adapters a clear injection point, but the default implementation does not probe a durable database or queue.

Health can mean the process is responsive enough to answer a simple route. Readiness can mean it is prepared to serve the traffic a deployment would send. The product should define which dependencies are required for that traffic. A form-loading service might remain useful while analytics is unavailable, whereas draft writes may require authoritative storage. One global boolean can be adequate for a small service, but it should be tied to a declared capability set.

Do not put destructive or expensive work into a frequent readiness probe. A proposed probe should avoid creating drafts, sending notifications, or scanning all submissions. It can test a lightweight dependency capability or consult a bounded cached health observation, with explicit staleness and timeout rules. A readiness endpoint that overloads the dependency it checks can worsen an incident.

## Failure and timeout semantics

The current route catches a rejected readiness call and returns not ready. It does not itself impose a separate timeout around a readiness promise that never settles. A proposed probe wrapper should define a deadline and ensure resources are released or cancellation is propagated when possible. Merely racing a promise against a timer does not necessarily stop the underlying work.

Repeated probes can overlap if one hangs. A proposed single-flight or cached check can bound that concurrency, but then its cache age becomes part of the readiness contract. Decide whether a recent success remains acceptable during a transient timeout and how quickly a known failure removes the service from traffic. These are deployment policy choices requiring measured recovery behavior.

Readiness failure should not automatically imply data loss. It means the configured capability check did not establish readiness. The incident report should identify the failed dependency or timeout category while avoiding secret connection details in public responses. Internal diagnostics can retain a bounded error category and correlation ID without exposing credentials or respondent payloads.

## Completion events are observations

The onResponse hook emits timestamp, severity derived from status, fixed event name, request ID, method, route pattern or unmatched marker, status code, and rounded elapsed time. It uses the injected clock for timestamp. The route pattern avoids logging a full raw path in the normal matched case, and the payload does not include request bodies or query strings.

These choices reduce unnecessary data exposure and make event aggregation more stable. They do not make the event stream a durable audit log. The sink is called directly and has no queue, retry, or local failure isolation in the shown hook. A proposed operational adapter should decide how sink failures affect request lifecycle reporting and how to avoid recursive failures while logging a logging failure.

Do not infer the exact client-visible consequence of a throwing onResponse sink without a targeted framework-level test. The hook occurs in a particular lifecycle phase, and that timing matters. The supported source observation is that the application does not catch the sink call locally. A characterization test can inject a throwing sink and observe the framework's behavior, but that is different from assuming it rolls back an already completed business operation.

## Request IDs are correlation hints

The API retains an incoming request ID only when it is a bounded string matching a restricted character set; otherwise it generates a UUID. The accepted incoming value is not guaranteed globally unique and is not authenticated. Two callers can choose the same allowed ID. Therefore, a log search by request ID is a useful correlation technique, not a cryptographic proof that every matching event came from one trusted request.

A proposed system can include a server-generated event or trace identity in addition to a client correlation value. Keep their roles distinct. Do not use a request ID as a submission idempotency key unless the protocol explicitly defines that lifecycle; retries and related requests may have different correlation needs. Earlier chapters separated resource, operation, and session identities for the same reason.

The bounded syntax also protects log structure, but it does not justify dumping arbitrary headers alongside it. Diagnostic payloads should be allowlisted. The current event interface is a useful small schema; expanding it should be driven by a specific operational question and a review of sensitive fields.

## Status-based severity has limits

The hook maps server errors to error, client errors to warn, and other responses to info. This is a simple classification, not a complete incident-priority model. A high rate of 409 draft conflicts may indicate normal collaboration or a broken autosave integration. A 200 duplicate submission can be expected retry recovery or an excessive retry loop. A healthy readiness response does not establish low latency for every endpoint.

Metrics should name populations and causes where available. Count conflicts separately from validation failures, and distinguish created submissions from duplicate replays using business outcomes if the instrumentation supports them. Avoid changing the response contract solely to make dashboards convenient. The event design should observe meaningful boundaries without leaking answer content.

For latency, rounded elapsed milliseconds are useful operational data, but they do not identify which phase consumed the time. A proposed tracing layer can separate parsing, validation, repository work, and downstream delivery when needed. Keep timing instrumentation bounded and avoid interpreting a single slow sample as a universal performance conclusion.

## Exercises

**FF-32A, eight points:** Define health and readiness capabilities for a durable deployment. Include probe deadline, overlap control, cache age, and the difference between not ready and data lost. Identify what the default current readiness actually checks.

**FF-32B, six points:** Review the completion event fields and direct sink call. Propose failure isolation and a targeted characterization test for a throwing sink without claiming a business operation is rolled back by an observation failure.

**FF-32C, six points:** Distinguish client correlation ID, server request identity, submission operation identity, and event identity. Design status and outcome metrics that can separate expected conflicts and duplicates from broken retry behavior.

## Exit evidence

A good operational contract makes probes cheap, bounded, and meaningful; treats telemetry as fallible; and preserves business outcomes independently of their observation. The service should remain diagnosable when one of those layers fails, without turning a missing log event into a fabricated claim about whether a draft or submission exists.
