# Review 01. Identity, validation, and conditional storage

Use this guide after chapters one through three. Before looking at a worked answer, try the hint and write a concrete prediction. The purpose of separate review is to preserve evidence of independent reasoning, not to make answers difficult to find. Keep your original ledger and annotate the rule that changed your prediction.

## FF-01A: independent address and history indexes

Hint: draw one list per slug and another list for the workspace/form pair. Append the same symbolic snapshot to two lists on each successful publication.

After the third operation, the form history contains P1, P2, P3 with display versions one, two, three. The cedar-survey address contains P1 then P3, so its lookup returns P3. The research-autumn address contains P2, so it returns P2. None of those operations mutates P1's schema. The repository clones input and returned publications, and each stored snapshot is a distinct record.

Award four points for both address results, two for the continuous form history, and two for explaining why neither slug nor display version alone identifies a snapshot globally. A correct answer does not invent a redirect. A particularly useful counterexample is a second form whose first publication also has display version one: equal display numbers do not make equal publication identities.

The deeper design lesson is that indexes can share records while expressing different access paths. If a durable adapter stores only a current-slug field on the form, it cannot automatically reproduce the old address behavior. The adapter needs either compatible data modeling or an explicitly approved contract change. Interface preservation is behavioral, not merely matching method names.

## FF-01B: namespace and payload policy

Hint: write the complete two-part repository key before comparing requests.

P1 plus a caller key and P2 plus that same key can each create a submission. P1 plus that key repeated returns duplicate with the first stored submission. Changed answers do not replace it. The current code checks for existing before constructing another record or advancing the sequence. That ordering is the reason an ordinary duplicate does not consume another submission number in this implementation.

Award two points for the namespace, two for retaining the first payload, and two for labeling changed-payload conflict as proposed. The proposal should compare a defined canonical representation or equivalent domain equality, preserve the original receipt, and return a stable conflict without exposing another response's content. It should not silently modify the first response while calling the operation duplicate.

At route level, the slug is resolved again before the repository key is formed. A complete answer notices that republishing can change the publication component. Do not subtract marks for not designing the full snapshot-pinning protocol yet; this exercise establishes the identity problem that later work must solve.

## FF-01C: agreement belongs to a boundary

Hint: search the API handler for form_identity_mismatch and note what has happened before that branch.

The route parses the body schema and compares schema.id with the formId parameter. A mismatch returns a 400 response before repository save. A repository-only test can verify version and copying behavior but does not execute the route check. Conversely, a route test with a mock repository can establish noninvocation on mismatch without proving the repository's internal conditional write.

Award two points for the location, two for the ordering, and two for the evidence distinction. A common weak answer asserts that FormSchema's type prevents disagreement. The type expresses a string id; it does not encode equality with a particular path parameter. Runtime agreement needs an actual comparison.

## FF-02A: shape and readiness

Hint: compare minimum string length with trimmed semantic checks.

A structurally valid form with a whitespace title can parse and then fail publication validation. A form containing only content fields can also parse while failing the requirement for a response field. A malformed discriminant, such as an unsupported field kind, fails parsing. Use one of these examples and provide all otherwise required fields so the intended branch is reached.

For the draft route, parser failure returns invalid_draft with 400. For publication, parser failure returns invalid_schema with 400; semantic issues after valid identity return schema_not_publishable with 422. A valid draft save may retain an unfinished form because that route does not call validateSchema. Award four points for distinct examples, two for outcomes, and two for controlling unrelated guards.

A regression that submits an invalid header and an invalid schema cannot establish schema rejection. Its failure could be entirely explained by the header guard. Use such combined cases only when explicitly testing rejection precedence, and keep a separate isolated fixture for each rule.

## FF-02B: current broad answer values

Hint: follow empty, required, and typeof checks in order rather than reasoning from the field's display label.

Required checkbox false is empty and produces the required error. Optional false reaches the early empty return and produces no field error. A number field containing the string zero is nonempty, converts to numeric zero, and then passes or fails its configured bounds. Do not assume a minimum absent from the fixture.

Boolean true is not empty. In a required email field it passes the required check, then returns at the non-string condition without running the email regular expression. That is a current characterization, not a recommendation for an email API. A proposed stricter contract would reject incompatible value types before kind-specific content checks, while retaining intentional checkbox behavior.

Award one point per correctly traced case and two for separating the proposal. A strong answer includes a route fixture because parseAnswers accepts booleans broadly; an implementation that rejects true earlier at the envelope level would change the trace. The test should expose which layer supplied the final result.

## FF-02C: first rejection and side effects

Hint: number the actual branches in the publish handler.

A mismatched workspace header wins over an invalid slug. With the header fixed, an invalid slug wins over schema parsing. With a valid slug and parseable schema, identity mismatch wins over returning the already-computed semantic issues. If identity agrees, semantic issues return 422 before publication storage.

Award three points for that ordering and three for noninvocation evidence. Computing issues is pure analysis in this trace, not a storage mutation. A test should verify the publication repository receives no call in rejected cases and, where a real isolated repository is used, that earlier snapshots remain unchanged. Do not infer that a no-call assertion proves every other dependency is side-effect free.

## FF-03A: versions without timestamp guessing

Hint: absent means current version zero for comparison, but there is still no current record to return.

An initial expected zero save produces version one. A stale expected zero save then conflicts with current version one. A later expected one save succeeds as version two. A nonzero expected version against an absent record conflicts with current undefined. The clock can return the same Date for both successful saves; versions still advance independently.

Award four points for the result matrix, two for unchanged schema on rejection, and two for the timestamp distinction. Include the conflict record's content, not just its status. A replacement implementation that returns the submitted stale schema as current would mislead recovery even though it correctly rejects the write.

## FF-03B: four alias routes

Hint: mutate a nested choice option, then perform a fresh repository read.

Keep each experiment independent. After saving, mutate the original schema; after another save, mutate the success result; after a find, mutate that returned result; after inducing a conflict, mutate its current record. In each case, a subsequent find must retain the stored nested value. Reset fixtures between experiments so an earlier accidental mutation cannot obscure which boundary failed.

Award one point for each ownership route and two for a nested value that discriminates against shallow copying. Tests that mutate only title are incomplete evidence for deep isolation. Tests that compare the same returned object twice are also weak: they do not revisit the storage boundary.

## FF-03C: durable acceptance

Hint: identify the absent-row race separately from the existing-row race.

Two initial writers require a unique workspace/form identity and an atomic insert outcome. Two updates sharing a version require only one to replace that version. The loser must receive a defined conflict result without overwriting the winner. A contract suite can run against both in-memory and durable adapters, but cross-process claims require real separate actors and the actual storage engine, not two stubs returning chosen outcomes.

Award two points for creation, two for conditional update, and two for honest evidence scope. A good proposal states how conflict state is read and what it guarantees if another writer advances again before that read. It also preserves defensive result ownership after database decoding, because durable storage does not excuse returning shared mutable cache entries.

Return to the [course route](README.md) when you can explain each answer from a named source expression rather than recalling the prose.
