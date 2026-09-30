# 27. Workspace authorization as an explicit policy

FormForge's API uses workspace and form IDs to scope draft data, and its publication route compares an x-workspace-id header with the route workspace. That comparison is a fixture-level guard, not a complete authenticated membership system. This chapter designs a proposed policy grounded in the actual routes in [app.ts](../../apps/api/src/app.ts) and the repository identities in [drafts.ts](../../packages/data/src/drafts.ts) and [publications.ts](../../packages/data/src/publications.ts). Answers are in the [policy review](review-10-authorization-and-event-delivery.md).

## Separate three identities

The workspace in a route names the resource scope. The form ID names a resource within that scope. The actor identity should identify the authenticated caller. A caller-supplied workspace header repeats a resource claim; by itself it does not establish who the caller is or whether they belong to that workspace. A proposed production design must derive actor identity from a trusted authentication boundary and evaluate membership separately.

The current draft GET and PUT paths do not show the publication route's workspace-header comparison. The publication route performs that comparison before slug and schema validation. This means authorization-like checks are not uniformly implemented across current endpoints. A course or test name saying authorizes publication should be read in the narrow context of the tested header behavior, not expanded into a claim of session authentication or role enforcement.

A review should avoid both exaggeration and alarmism. The repository is a learning application with explicit demo boundaries. The useful next step is an endpoint policy matrix that identifies what a production integration would need, not a vague declaration that adding a header everywhere solves security. Resource scoping and authorization are connected but distinct responsibilities.

## Build the policy matrix

For a proposed workspace, define viewer, editor, and publisher capabilities or another small role set appropriate to the product. List draft read, draft save, publication creation, publication history read, comment creation, response export, and analytics read separately. Some operations may not yet have API routes; mark those as proposed surfaces rather than inventing existing endpoints.

The matrix should identify both the actor check and the resource check. An editor may save a form only within an authorized workspace. A publisher may publish only a schema whose form ID matches the route and whose slug ownership remains valid. Authorization does not replace schema identity validation, and schema identity validation does not establish authorization. Each check protects a different invariant.

Public form loading and response submission need a different policy. They may intentionally allow anonymous respondents while protecting workspace drafts and response data. A public slug should reveal only the published respondent contract, not internal comments, draft history, or operational metadata. If the product introduces authenticated respondents, that is an additional decision with consequences for idempotency scope and privacy.

## Order checks without leaking unnecessary facts

Decide whether unauthorized callers receive forbidden or not found for private resources. Either choice must be applied consistently with the product's disclosure policy. A not-found response can reduce resource enumeration, but inconsistent timing, list endpoints, or error details can still reveal existence. Do not claim perfect concealment from one status code.

Validation order also affects disclosure and cost. Authentication can happen before expensive schema parsing. Resource authorization may require a lookup, while basic route syntax can be checked earlier. A proposed handler should document the sequence and test both the result and absence of downstream calls when an early check fails. An unauthorized request should not reach a persistence mutation merely because its schema is valid.

The current injected repositories make such call-boundary tests practical in principle: a test double can record whether save or publish was invoked. That proves adapter routing under the fixture, not the correctness of a real identity provider or database membership query. Separate those evidence layers when planning an integrated authorization test.

## Revocation and in-flight work

Suppose an editor begins a draft save, then loses membership before the operation commits. The policy must define whether authority is checked at request admission, transaction execution, or both. For short synchronous in-memory operations, the window is small; a durable adapter with queues and I/O can make it significant. Do not assume an authorization decision remains valid forever because the request began legitimately.

A proposed transaction can read membership and update the draft under a suitable consistency rule, or a service can define a bounded authorization snapshot for each request. The exact mechanism depends on the storage and identity system. The important requirement is that the product chooses the revocation semantics and can explain an accepted operation racing with a membership change.

Cached permissions introduce another lifetime. A cache can improve performance while allowing a revoked capability to persist until expiry unless invalidation is coordinated. Define the maximum tolerated stale interval and failure behavior when the membership service is unavailable. Fail-open and fail-closed choices have different availability and protection consequences; do not hide them behind a generic cache abstraction.

## Tenant isolation below the handler

Repository keys include workspace scope, but callers can still pass the wrong workspace if adapters are careless. A proposed data access layer can require an authorized workspace context or consistently constrain every query by tenant identity. Composite uniqueness and indexes should match the same scope. A query by formId alone can return or modify another workspace's form even when the table contains a workspace column.

Background jobs need the same discipline. An export or analytics worker may run without the original HTTP request object. It must carry an explicit authorized job scope and recheck relevant permissions according to the job policy. Copying a request header into a job payload does not make that payload trustworthy indefinitely. The job's creator, scope, and lifecycle should be recorded independently.

For tests, create two workspaces with identical form IDs and different schemas. Verify that authorized reads and writes remain isolated and that a caller cannot substitute a route workspace to cross the boundary. This is stronger than testing only unique IDs because it removes accidental global uniqueness that can conceal a missing tenant predicate.

## Exercises

**FF-27A, eight points:** Write the endpoint policy matrix and distinguish actor, workspace, and form identities. Identify the exact current header guard and the draft routes' current behavior without claiming a complete authentication system exists.

**FF-27B, six points:** Specify check ordering, unauthorized-resource disclosure policy, and repository-call assertions. Include a revoked editor with an in-flight save and state the authority boundary your proposal chooses.

**FF-27C, six points:** Design a two-workspace isolation fixture and a background export authorization context. Explain why identical form IDs are important test data and how cached permission lifetime affects revocation.

## Exit evidence

A coherent policy can answer who acts, on which resource, under which capability, and at what time the decision is authoritative. It also preserves the existing schema, version, and slug invariants. Adding authorization should strengthen the system's boundaries without using permission checks as a substitute for data correctness.
