# 38. API validation order and negative evidence

An API test that receives an error code has not necessarily proved that no side effect occurred. This chapter designs precise negative-path evidence around [app.ts](../../apps/api/src/app.ts) and [app.test.ts](../../apps/api/src/app.test.ts). It focuses on validation order, repository invocation, and preservation of prior state. Answers are in the [model and adapter review](review-13-models-and-adapter-evidence.md).

## One request can violate several rules

The draft PUT checks expectedVersion before parsing schema, then checks schema ID against route form ID before saving. A request with both an invalid version and malformed schema will fail at the first guard. A test that supplies both defects cannot independently establish that schema parsing rejects the malformed value, because execution may never reach that branch.

Similarly, publication checks the workspace header, slug syntax, schema parsing, identity, and publishability in a defined order. A missing workspace header can mask an invalid slug in a combined fixture. This does not make the endpoint wrong; it makes test interpretation important. Each targeted guard needs a fixture where earlier guards pass.

Write a validation ladder for each route. At every rung, list the input assumptions required to reach it, the expected error category, and whether repository calls should remain absent. Then add a separate combined-invalidity test only if the precedence itself is part of the contract. This separates guard coverage from ordering coverage.

## Prove absence of mutation

For a rejected draft identity, inspect both the response and the repository state or call log. If the route returns a mismatch error but still called save before discovering it, the status assertion alone would miss an unwanted side effect. The current source places the identity check before save; a meaningful test can protect that ordering.

An injected recording repository can fail the test if save or publish is invoked during an early rejection. A stateful fixture can also perform a later GET to confirm no draft was created or an existing record remained unchanged. These observations complement each other: call absence proves adapter routing, while state inspection proves the fixture's observable storage result.

Do not confuse no observed mutation in an in-memory fake with durable rollback under a real database failure. The negative-path adapter test establishes that the application did not request the mutation for that input. A transaction test establishes what storage does after it receives an operation and fails midway. The boundaries differ and should be named in the test report.

## Conflict is a domain result

A draft conflict returns a structured result with current state and HTTP 409. A publication slug conflict is represented by a specific error class and mapped to a slug-unavailable response. Unexpected exceptions are not automatically domain conflicts. A test should distinguish these cases so future catch-all error handling does not convert infrastructure failure into a misleading user-action message.

For example, a publication repository throwing an arbitrary error should not be treated as proof that the slug belongs to another form. The user might choose another slug repeatedly while the database remains unavailable. Stable error categories help recovery only when they correspond to the actual failure class.

The reverse mistake also matters: exposing a known uniqueness conflict as a generic server error makes a routine concurrent action look like an outage. A durable adapter should map storage-specific constraint results into domain outcomes, while the HTTP adapter maps domain outcomes into protocol responses. Testing both layers separately keeps responsibility clear.

## Positive controls for negative tests

A negative test can pass because the route is never registered, the request path is wrong, or a setup fixture is invalid. Include a nearby positive control proving that a valid request reaches the intended handler and repository. This does not require duplicating every happy-path test; it requires enough setup evidence to know the negative case is testing the intended boundary.

For publication, a valid authorized fixture should create a snapshot before testing a cross-owner slug conflict. For draft version conflict, create a known version and then submit a stale expectation, checking that the original schema remains. For submission validation, ensure the slug resolves to a real publication and that the key passes its shape check before testing answer errors.

Use synthetic data with deliberate differences so preservation assertions are meaningful. If the attempted overwrite and original schema are identical, a mutation bug can remain invisible. Give the original and attempted titles distinct values, and inspect the exact retained record rather than only its existence.

## Error-body contracts and information scope

The API uses stable code fields for many validation outcomes. A client can branch on those codes more reliably than on human messages, but the contract should specify which details are safe to expose. Schema issues can help an authorized editor correct a draft; private current state in a conflict response requires proper authorization in a production system.

An error test should inspect essential fields without overfitting incidental serialization order or stack text. Conversely, asserting only status can miss a changed code that breaks the client's recovery route. Choose assertions at the intended public contract: status, code, relevant structured fields, and absence of sensitive data where applicable.

The current application is a demo with injected repositories and limited authorization. A production hardening test plan should label new access-control expectations as proposed. Do not fail a current characterization test against a policy that has not been implemented and then report the entire source as inconsistent with itself.

## Exercises

**FF-38A, eight points:** Build validation ladders for draft save, publication, and submission. For each target guard, create a fixture that passes earlier guards. Add one combined-invalidity case specifically to test precedence.

**FF-38B, six points:** Design negative evidence for identity mismatch and stale-version conflict using both call recording and subsequent state inspection. Include distinct original and attempted content and a positive control.

**FF-38C, six points:** Separate domain conflict, unexpected repository exception, and authorization failure in a proposed error matrix. Specify stable response assertions and which evidence belongs to adapter routing versus durable transaction behavior.

## Exit evidence

The best negative tests establish both what was returned and what was not allowed to happen. They isolate one guard at a time, preserve meaningful prior state, and avoid claiming storage guarantees from an adapter that never invoked storage. That precision makes refactors safer without creating a large collection of redundant status-code tests.
