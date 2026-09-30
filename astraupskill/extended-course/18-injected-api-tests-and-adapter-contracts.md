# 18. Injected API tests and adapter contracts

FormForge's [API tests](../../apps/api/src/app.test.ts) exercise requests through a Fastify instance without opening a listening socket. That is stronger than directly calling a repository for route behavior, but narrower than a deployed browser-to-server experiment. Understanding this boundary helps you choose tests that are both useful and honest.

## The composition function creates isolated collaborators

buildApi accepts optional draft, publication, submission, readiness, event, and clock dependencies. When repositories are omitted, it constructs new in-memory instances for that API instance. A fresh buildApi in a test therefore starts with separate default storage. Sharing an explicitly supplied repository changes that fixture lifetime and should be deliberate.

The tests close the app after use. A future asynchronous adapter may own connections or other resources whose disposal needs explicit responsibility. Closing Fastify does not automatically prove every injected repository closes itself unless the composition registers that lifecycle. A durable-adapter plan should specify ownership rather than leaving cleanup implicit.

Dependency injection enables targeted failure tests. A publication repository can throw the known slug conflict error to exercise mapping; another can throw an unexpected error to exercise the framework's error path. Those tests do not establish the repository's real ownership constraint. Pair them with adapter contract tests that inspect retained state.

## Route disagreement is tested with a fresh read

The identity-mismatch test submits demoForm under a different route form id for both draft and publication. It asserts 400 and form_identity_mismatch, then reads the draft and public slug and expects 404. The read-after-rejection observations strengthen the claim that rejected requests did not leave accessible stored data in the default repositories.

A no-call mock assertion would isolate route ordering, while this fresh-read approach also exercises the actual in-memory storage composition. Neither automatically proves a durable transaction rollback. When swapping adapters, keep a shared contract suite for externally observable behavior and add storage-specific failure tests separately.

The malformed-draft test uses both a negative expected version and an incomplete schema. It establishes rejection of that request, but the early version guard can account for the result without reaching schema parsing. If the goal is independent parser coverage, create a second fixture with a valid expected version and malformed schema. This is the same rejection-ladder discipline used throughout the course.

## Publication tests need ownership and immutability distinctions

The current slug-conflict test publishes for one workspace, attempts another owner, then reads the public slug and confirms the original workspace/version. That directly protects against replacement on conflict. A same-workspace different-form fixture would add coverage for the second owner dimension.

The test named publication authorization checks x-workspace-id agreement. Its name should not cause a reviewer to infer a trusted authentication system. The route compares a caller-controlled header with the path, as earlier chapters established. A real authorization extension requires distinct authenticated principals and membership rules, with negative cases that cannot be bypassed by changing the header.

Likewise, a public read showing the expected schema after publication does not by itself prove deep snapshot isolation. A defensive-copy test must mutate nested input or returned values and reread. Use the repository-level clone tests for that ownership boundary, then ensure the API serializes the intended result.

## Retry tests should separate route and repository semantics

An API submission test can establish status 201 on creation and 200 on duplicate under the same resolved publication and caller key. It should assert stable submission identity and retained answers, not only statuses. A repository test can characterize changed-payload duplicate behavior without route validation. Both are needed if the product's retry contract spans validation and storage.

A durable adapter adds concurrency and uncertain-outcome questions. Two injected requests in one process against a synchronous map do not prove a multi-process database uniqueness constraint. A fake adapter returning duplicate on its second call proves only that the route maps that result correctly. Label the evidence accordingly.

## Build a contract matrix before adding tests

Rows should cover identity agreement, version validity, stale save, slug ownership, public lookup, answer validation, duplicate response, and readiness. Columns should separate current implementation, injected dependency, observable response, retained state, and untested deployment behavior. This prevents a large suite from collecting redundant happy paths while missing one consequential boundary.

For each new case, write the plausible mutation it detects. Removing form-id comparison should make a mismatched request reach storage. Replacing publication owner comparison with workspace-only should let another form take the slug. Advancing draft version on conflict should fail retained-state checks. Returning 201 for duplicate should fail response mapping even if storage remains correct.

Tests should not merely repeat the implementation's expression as the expected calculation. An independent fixture table is more diagnostic. For example, use known versions and distinct titles rather than reading the stored result to construct the expected result. Preserve a before snapshot when testing rejection.

## Independent practice

**FF-18A, eight points:** Select three existing API tests and write the exact claim each supports, including one stronger claim it does not support. Identify a case whose multiple invalidities hide later validation coverage.

**FF-18B, six points:** Design a reusable repository contract suite and one durable-adapter-specific concurrency test. State why two mocked responses do not replace actual storage evidence.

**FF-18C, six points:** Add a mutation-to-assertion matrix for identity, ownership, version, and duplicate status. Keep proposed new tests separate from tests actually executed in your report.

Review with [models, operations, and API evidence](review-07-models-operations-and-api-tests.md). Return to [the course route](README.md) for the next independent design modules.
