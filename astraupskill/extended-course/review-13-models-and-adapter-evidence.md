# Review 13. Models and adapter evidence

This guide reviews chapters 37 through 40. The executable submission model is intentionally small and the capstone is a proposal. Keep model properties, current route behavior, and durable integration claims separate throughout the review.

## FF-37A: six bounded checks

The checks cover detached input/result answers, first-wins changed-payload replay, separate scope under a new publication, early rejection before lookup, previous-state preservation, and unambiguous tuple encoding in the model. The source concepts include repository copy isolation, publication/key scope, and route validation order. The model differs in synchronous immutable state, omitted clock, model IDs, and tuple encoding.

Award four points for mapping the checks and four for limitations and differences. The null-separator fixture proves a tuple-encoding distinction under synthetic unrestricted strings. It does not establish that the HTTP adapter accepts those exact strings or that an end-to-end vulnerability was tested.

## FF-37B: scope traces

P1/K with Ada creates; P1/K with Grace returns the original Ada record; P2/K creates another record; valid false rejects before lookup. To characterize the real republish race, a test must create P1 under a slug, submit, publish P2 under the same slug, and retry through the route while inspecting publication IDs and stored submissions. The pure model supplies scope directly and does not resolve slugs.

Award three points for the model trace and three for the real-adapter steps. A green model cannot prove Fastify parsing, schema validation, or durable uniqueness. Those are explicit continuation boundaries, not reasons to discard the model's useful local evidence.

## FF-37C: deliberate extension

The learner-owned extension should define canonical answers and distinguish matching replay from payload conflict. It should preserve type and missingness decisions, test equivalent property order if that is part of the contract, and define behavior after retention expires. Keep reference files unchanged and avoid importing runtime modules just to obtain a misleading integration label.

Award two points for canonicalization, two for outcomes/checks, and two for retention and ownership. Deleting retained entries while claiming unlimited duplicate protection is inconsistent. Adding fake authentication or a database-shaped object does not establish those real boundaries.

## FF-38A: validation ladders

Draft save checks expected version, schema parsing, and route/schema identity before save. Publication checks workspace header, slug, parsing, identity, and publishability before repository publication. Submission resolves publication and checks request shape and answers before repository submission. Each focused fixture must pass earlier guards to exercise the intended later one.

Award four points for the ladders, two for isolated fixtures, and two for a combined-invalidity precedence case. A request invalid in several ways can prove ordering but cannot independently prove every guard. A negative test returning an error from the wrong route is not useful coverage.

## FF-38B: absence of effects

Recording repositories can assert no mutation call occurred after an early identity mismatch. Stateful fixtures can confirm that no draft was created or that a stale-version attempt preserved the distinct original schema. Positive controls establish that valid setup reaches the intended handler. Use visibly different original and attempted content so an unintended overwrite is detectable.

Award two points for call evidence, two for state evidence, and two for fixture quality. These tests establish adapter routing and fixture outcomes. They do not prove database rollback after a real transaction receives a mutation and fails.

## FF-38C: error responsibilities

Known draft or slug conflicts map to domain outcomes; unexpected repository exceptions remain infrastructure failures; authorization failures stop access according to policy. Stable response assertions include status, code, and relevant structured fields without depending on incidental stack or serialization details. Durable constraint mapping belongs in the adapter, while HTTP mapping belongs at the route boundary.

Award three points for the matrix and three for evidence/responsibility separation. A catch-all slug-conflict response can mislead users during an outage, while an unmapped known uniqueness race can make normal concurrency look like a server failure.

## FF-39A: builder properties

Under unique IDs, move preserves field identity/content and changes order according to the clamped target; remove eliminates the target while preserving remaining relative order; duplicate adds one field when the supplied ID is new. Moving away and back can restore order without guaranteeing every UI-state or reference detail is identical. Remove/re-add is not a general inverse.

Award four points for properties and assumptions, two for the too-strong inverse claim, and two for the corrected invariant. A colliding supplied ID tests a proposed uniqueness guard, not a current reducer guarantee. Label that distinction so generated failures remain interpretable.

## FF-39B: query and CSV relationships

On a fixed dataset with a total order, pagination should reconstruct the ordered filtered population, and reversing sort direction reverses the full result when it fits in one page. Equal timestamps require the ID tie-breaker. Deleting an anchor changes the assumptions because the current helper restarts on a missing anchor. CSV logical rows must be counted after parsing because quoted cells can contain newlines.

Award three points for query assumptions and three for representation-aware export checks. Raw newline count is not a reliable CSV record count. A property must describe the actual representation boundary it observes.

## FF-39C: analytics transformations

Permutation preserves aggregate results. Duplicating every journey doubles counts while preserving rates and the median of duplicated eligible durations. Choice response duplication doubles eligible counts while retaining rates. Empty strings and booleans are omitted from choice categories, while a whitespace-only string is truthy and included under current behavior.

Award three points for the transformations, two for blank-value distinctions, and one for minimal counterexamples and labeling. A proposed trimming policy can be tested separately, but should not be smuggled into a characterization property that claims to describe the current helper.

## FF-40A: response interpretation

Either publication-bound acceptance or an explicit latest-only mismatch can be coherent. The protocol must name the publication/schema interpretation, immutable operation key, canonical answers, and replay result. Republish cannot silently reinterpret an already loaded response. A request correlation ID is not automatically the logical response key.

Award four points for the chosen policy and four for protocol artifacts and identity. The answer should explain how rules and flow are versioned if included. A schema snapshot that depends on mutable interpretation data is incomplete for historical response validation.

## FF-40B: durable boundary

The storage design coordinates submission identity, stored effect, and retained replay evidence, plus event intent if that extension is chosen. Scenarios include ordinary success, republish, lost response, changed payload, concurrent first attempts, expiry, archive, and early validation failure. Independent durable clients are needed to establish concurrency; the pure model cannot provide that evidence.

Award three points for atomicity and three for adverse cases/evidence. A durable response with an in-memory-only receipt can lose replay protection on restart. A success receipt before effect commitment can lie after failure. Both splits must be prevented or explicitly recoverable.

## FF-40C: recovery without data loss

Changed-schema handling preserves the draft and explains required review. Changed payload under one key produces a defined conflict or deliberate new operation, not false replay success. Expired evidence has a documented recovery policy and does not silently promise unlimited deduplication. Feedback distinguishes accepted, correctable, conflicting, and uncertain outcomes.

Award two points for each case and its user-facing evidence. Local draft storage supports recovery but is not server acceptance. The current demo receipt does not validate the proposed network protocol. A strong capstone report states those limits while still giving a concrete next implementation step.
