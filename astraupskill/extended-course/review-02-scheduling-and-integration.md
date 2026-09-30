# Review 02. Scheduling, incidents, and the integration capstone

These answers cover the opening route's asynchronous and integration work. The hints ask you to distinguish identities and phases before considering implementation changes. If your original answer differs, retain it and write the smallest schedule that falsifies it. That habit is more valuable than replacing your worksheet with the reference text.

## FF-04A: a success can be stale for display

Hint: track local request identity and accepted server version in separate columns.

A begins after its debounce with expected version zero. B's edit advances the local sequence immediately and displays queued. When A returns saved version one, the committed version becomes one, but A's request id no longer matches latestRequest, so the display stays queued. When B runs, it reads the updated version and sends expected one. Its own success can display saved version two if B is still latest.

The two columns answer different questions. The server version records a completed write that later requests must respect. The display describes the newest local edit. Award three points for the schedule, three for retaining A's committed version, and two for suppressing A's obsolete status. A wrong model that discards the entire A result can preserve the UI while causing B to conflict unnecessarily.

## FF-04B: conflicts and failures do not acknowledge a version

Hint: locate the only branch that assigns version.current.

A conflict does not advance the committed ref. If superseded, its message is hidden; B eventually submits the still-committed version and can surface its own conflict. A rejection also does not advance the version. The queue catch suppresses an obsolete error message and settles the chain so later work can run. A current rejection displays error.

Award two points for conflict version, two for rejection recovery, and two for distinguishing timer expiry from saver invocation. The saving label can appear while B waits in the chain. That broad label is not evidence of overlapping network calls. To establish serialization, inspect the call count while A remains unresolved.

## FF-04C: form identity is not a request number

Hint: local request sequence alone may be insufficient if one hook instance starts serving a different form without a deliberate reset contract.

A proposed test loads form A at version four, edits it, starts a save, switches to form B at version nine, and resolves A afterward. B's schema and version must remain B's. The old request may still have committed A remotely; local cancellation cannot undo that. A test should record the old server result separately from the new editor state.

The proposal needs loaded-version initialization, ownership of each pending operation, and a policy for unmount or route change. A keyed component boundary, explicit session token, or adapter state machine can be evaluated, but naming one does not prove it works. Award two points for identity separation, two for initialization, and two for uncertainty handling. A response discarded locally should not be relabeled server rollback.

## FF-05A: address migration is a new contract

Hint: read findBySlug rather than assuming a form has only one current address.

The current implementation retains independent latest snapshots per slug. A redirect proposal needs a representation of redirects, loop prevention or a simpler acyclic rule, and a response contract for public readers. A frozen-old-address proposal can preserve current behavior but should explain that responses may target different snapshots. A remove-old-address proposal needs a reserved-name policy and an explicit result for old links.

Award four points for current trace and four for a coherent proposal covering readers and pending attempts. No single migration policy is mandatory. The grading criterion is whether the policy is explicit and compatible with the chosen retry identity. A design that redirects display but submits to an unrelated newly resolved snapshot needs further work.

## FF-05B: validation precedes duplicate lookup at the route

Hint: mark every row with whether it reaches submissions.submit.

Identical valid answers at the same publication/key reach duplicate handling and return the first receipt. Reordered properties also reach that same repository key, because current duplicate lookup does not compare content at all. Changed valid answers likewise return the first receipt. Changed invalid answers can be rejected by validateResponse before duplicate lookup. A newly resolved publication can create a new record under the same caller key.

Award one point for each row and one for the layer distinction. A future fingerprint policy must define equality and placement relative to validation. For example, retaining the first parsed request representation might simplify exact retries but still needs a decision about replay after schema changes. Do not silently promise a general-purpose idempotency protocol from this narrow local map.

## FF-05C: historical rows need historical cardinality

Hint: one unique reservation does not mean one immutable publication forever.

A compatible proposed schema can hold one slug reservation per address, recording workspace/form ownership, plus multiple publication snapshots and a pointer or query for the latest snapshot at that address. A form history can be queried by workspace/form and its assigned publication version. Concurrent publication must allocate the next form version under an appropriate unique constraint or transaction strategy, not only increment a stale application counter.

Award two points for reservation ownership, two for many snapshots, and two for a coherent transaction/evidence plan. A unique slug index directly on a one-row-per-snapshot table would forbid the second publication at the same slug unless the data model changes. This counterexample is why learners should work through cardinality before writing database commands.

## FF-06A: adapter outcomes carry different recovery actions

The load/save contract should validate received schema and version, bind responses to workspace/form identity, and distinguish accepted, stale, invalid, missing, and uncertain outcomes. The accepted response is the authority for the next version. A conflict is an invitation to review competing state, not permission to silently overwrite it. A malformed response cannot safely advance editor state just because status is 200.

Award five points for version and identity ownership and five for failure categories with concrete next actions. A concise state table can earn full marks if it is complete. A long diagram that treats every failure as retry fails the essential criterion. Include an explicit current-code limitation: the existing hook does not accept an initial loaded version parameter.

## FF-06B: the independent model must reject a plausible wrong transition

A strong model has an active session identity, a local edit generation, a committed version, a local buffer, and an operation ledger. It need not mimic every React implementation detail. It must make a late response from another session ineligible to replace current editor state and retain local work on conflict.

The counterexample is essential. Feed a late load or old save result to a naive accept-every-result transition and show the wrong form or title appears. Then show your model preserves the current state. Award four points for the required transitions, four for the counterexample, and two for stating that this is a model until integrated with the actual component.

## FF-06C: publication needs a named source of truth

A valid design chooses either the visible current schema or an accepted draft snapshot for publication and makes the UI promise match. It consumes the returned snapshot id rather than generating a convenient substitute. The evidence plan includes an actual adapter call and a browser observation, while maintaining separate results for pure model checks.

Award four points for the publication decision, three for evidence layers, and three for limitations. If repositories remain in memory, restart loss remains a limitation even when refresh succeeds against a running server. If workspace identity still comes from a caller-controlled header, production authorization remains unimplemented. Neither limitation invalidates a clearly scoped teaching slice, but both invalidate a completion claim that includes durable authenticated collaboration.

## Closing the opening assessment

The opening route has eighteen exercises and one thirty-point capstone embedded in its final chapter. Total available points are one hundred thirty. Use the per-exercise criteria to identify weak concepts rather than grading by document length. A learner who cannot distinguish submission identity from slug lookup should revisit the first and fifth chapters before implementing retry recovery.

Keep three artifacts: your original predictions, the smallest failing counterexamples, and a final source-linked explanation. Together they show learning progress without requiring application changes. The [course index](README.md) tracks later modules separately; this opening route is usable while the larger requested expansion remains in progress.
