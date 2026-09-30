# 25. Submission replay and publication races

The submission repository deduplicates by publication ID and idempotency key. The public route first resolves a slug to a publication and validates the request before calling that repository. These layers jointly determine retry behavior. Read [submissions.ts](../../packages/data/src/submissions.ts) and the public submission handler in [app.ts](../../apps/api/src/app.ts). This chapter moves beyond the simple duplicate test to publication changes, payload mismatch, and durable coordination. Answers are in the [review](review-09-durable-repository-contracts.md).

## The exact current duplicate rule

The repository constructs a key from publicationId, a separator, and idempotencyKey. If a record already exists, it returns duplicate with a clone of the existing record. It does not compare the new answers with the stored answers. For a new key, it increments its local sequence, creates a submission ID, clones answers, records the clock time, stores the record, and returns created.

Thus, within the same publication and key, the first repository call wins even when a later call supplies different answers. That is an exact current behavior, not necessarily the desired public API contract. A stronger proposal might reject same-key/different-payload requests, but it must add a fingerprint rule and a distinct result or error. Do not describe such a mismatch check as already present.

The repository's IDs are process-local sequential strings. They are convenient for the in-memory fixture, but a durable adapter must define globally unique or appropriately scoped IDs across restarts and multiple writers. Merely persisting records while resetting the sequence to zero can create collisions unless the storage engine allocates identity or the adapter restores and coordinates the sequence.

## Route validation precedes replay lookup

The HTTP handler resolves the current publication by slug, parses the answers and key, validates the answers against that publication schema, and then calls the repository. Therefore, an invalid retry can fail before the duplicate lookup, even if the same publication/key was previously accepted. The repository's first-wins rule applies only after the request reaches it.

This ordering matters when describing idempotency to clients. A claim that every repeated key returns the original result regardless of body is too broad for the route. For example, a malformed body or answers that fail current validation can be rejected before replay. The exact observable outcome depends on both the route's validation order and the repository's key scope.

A proposed strict replay protocol could look up a retained operation before business validation, but it must still authenticate and authorize the caller and compare the intended payload identity. Returning an old success for an unrelated or unauthorized request would be wrong. There is no universal rule that replay lookup always comes first; the design must define which checks protect access, which identify the operation, and which apply only to a new effect.

## Republish between initial request and retry

Suppose a respondent loads slug research when it resolves to publication P1. They submit with key K and the request is accepted under P1, but the response is lost. The form owner republishes the same slug as P2. The respondent retries the same slug and key. The route now resolves P2, so the repository scope becomes P2 plus K. The retained P1/K record does not deduplicate the new scope.

Depending on P2's schema, the retry may fail validation or create a new submission under P2. The same public URL and key do not guarantee replay of the original publication's result. This is a concrete consequence of resolving the mutable slug before choosing the publication-scoped key.

The initial page schema can also become stale before the first submission. If the browser rendered P1 but the server validates against P2, required fields or choices may differ. A production flow should decide whether respondents submit to the publication they loaded, must refresh to the latest version, or receive a version-conflict response. The current demo public page does not implement this full network integration, so the chapter describes the API-level race and a proposed client contract.

## Bind a respondent session to a publication

A proposed public response session can include an immutable publication ID obtained when loading the form. The submission endpoint can require that ID or a signed/opaque session token that identifies it, then validate against that snapshot. The slug remains a discovery alias, while the publication ID defines the schema contract for the response. Authorization and availability policies still apply: an archived publication may or may not accept further submissions according to product rules.

If the product instead requires latest-only responses, make the version mismatch explicit. Return a structured conflict or refresh requirement before accepting answers under a different schema. Do not silently reinterpret an old choice ID or required-field set under the new publication. The client can preserve the respondent's draft while explaining which questions changed.

The idempotency scope should match that session contract. A key generated once for a logical response attempt should remain stable across transport retries, while a deliberate new response should use a new key. Reusing one key for every form submission in a browser session can suppress legitimate later responses; generating a new key for every retry can create duplicates. The key's lifecycle is a domain choice, not an incidental UUID call placed inside a retry loop.

## Payload fingerprints and canonicalization

A proposed mismatch detector needs a definition of equivalent answers. Object property insertion order may differ even when the field-value mapping is the same. Undefined values can disappear under JSON serialization. Missing, empty string, and false can carry distinct meanings, especially after conditional-field normalization. A fingerprint should operate on a declared canonical representation rather than arbitrary object serialization.

For example, the contract might sort field IDs, preserve value types, and explicitly encode omission versus a present value. It must also decide whether unknown answer keys are rejected, ignored, or included. If normalization trims strings, the stored answer and fingerprint should agree about that normalization. Otherwise, the service can report two payloads equivalent while storing a difference the user considers meaningful.

Do not canonicalize away distinctions merely to reduce conflicts. A checkbox false is not the same data as the string false. A choice ID is not its display label. A numeric string may intentionally preserve respondent formatting even if validation converts it temporarily for range checking. The fingerprint belongs to the submission contract and should be reviewed with the schema's answer semantics.

## Durable first-wins coordination

A durable adapter needs a uniqueness rule on publication identity and idempotency key, plus atomic creation of the submission record and any retained fingerprint/result. Two concurrent matching requests should converge on one stored submission and a recoverable result. A preflight lookup followed by an unconstrained insert can race. The losing insert should read the authoritative existing record and apply the mismatch policy rather than return an unexplained infrastructure error.

If submission triggers email or analytics events, storing the response and sending the side effect in unrelated operations can split under failure. A proposed transactional outbox can record the event intent with the submission, then deliver it with its own retry identity. That is an extension, not behavior in the current repository. The submission's idempotency key does not automatically make every downstream side effect exactly once.

## Exercises

**FF-25A, eight points:** Trace first-wins duplicate handling for matching and changed answers, then include route validation before repository lookup. State the exact current behavior and a proposed mismatch policy without confusing them.

**FF-25B, six points:** Work the P1 acceptance, lost response, P2 republish, and retry timeline. Propose publication-bound respondent sessions or an explicit latest-only conflict policy, and preserve the respondent's draft during recovery.

**FF-25C, six points:** Define key lifecycle, canonical answer fingerprint, durable uniqueness, and downstream event handling. Include missing, empty string, false, and unknown-key decisions, and explain why a unique submission does not automatically prove unique email delivery.

## Exit evidence

A reliable retry contract binds an operation to an immutable interpretation of its answers. The publication scope, payload identity, and retention behavior must agree. Without that agreement, the same-looking retry can become a different operation after republishing even when the client faithfully reuses its key.
