# 22. Builder identity allocation and action observation

The builder reducer teaches immutable transformations, but the component around it owns ID allocation, event dispatch, and change notifications. Those responsibilities can fail independently of a correct reducer. This chapter reads [FormBuilder.tsx](../../apps/web/src/FormBuilder.tsx), the [builder reducer](../../packages/core/src/builder.ts), and the [focused component tests](../../apps/web/src/FormBuilder.test.tsx). Complete the exercises before the [separate review](review-08-renderer-and-builder-contracts.md).

## Allocation by count is not uniqueness proof

The component initializes a sequence ref to the number of fields in the starting schema. Each new ID increments that number and combines the selected kind with it. For a known demo schema, this can produce convenient readable IDs. For an arbitrary initial schema, however, field count does not prove that the generated kind-number string is unused.

Construct a valid initial schema with two fields, one already named text-3. Adding a text field increments the sequence from two to three and proposes text-3 again. The reducer's add action appends the supplied field and does not independently enforce unique IDs. Schema validation can then report a duplicate, but the invalid state has already been constructed. This is a deterministic source-derived counterexample, not a need to scan every possible ID.

Deletion creates a different scenario. The sequence ref does not decrement when fields are removed, so it avoids simple reuse caused by shrinking the current count within that mounted session. That is useful, but it does not solve collisions in the initial schema or across separately created builders. Distinguish monotonic local allocation from global uniqueness rather than labeling the strategy simply safe or unsafe.

## Choose an identity policy

A proposed local builder can generate an ID and check it against current schema IDs, advancing until it finds an unused value. This is sufficient for a single local schema under its stated ownership model, but a collaborative builder needs an allocation strategy that remains unique across concurrent authors. Random identifiers, actor-scoped counters, or server allocation are possible approaches, each with tradeoffs in readability, collision handling, and offline work.

Do not derive identity from the field label. Labels are editable, can repeat, and can be localized. A label-based key would turn a presentation change into a data identity change, affecting saved answers, rules, page references, and analytics. Similarly, array position is an ordering property, not a stable field identity. Reordering should preserve the field's logical identity and any row-local state attached to it.

The current field rows use field.id as React key. The test that opens details for Work email and then moves that field verifies that disclosure state stays with the field in the tested sequence. This is a useful identity invariant. Replacing the key with array index might make the list render without warnings while attaching local state to a position instead of the intended field.

## Two reducer evaluations with different purposes

The component's send function computes `next` by calling the reducer with the state captured by the current render. It then dispatches the action and calls onSchemaChange with next.schema. React's reducer state update and the externally computed notification are related, but they are not the same execution path. The source evaluates the reducer once for the predicted callback value and lets React evaluate queued actions for component state.

In ordinary separate user events, React typically has an opportunity to render between actions, and the current tests exercise that familiar path. A more demanding schedule can enqueue multiple sends before a new render. Both manual next computations can use the same captured state, while the queued reducer actions are applied sequentially to evolving state. The callback sequence can then differ from the final component state.

Treat this as a characterization question, not a claim that every button click loses changes. The necessary condition is multiple actions dispatched through the same render closure before the next render updates it. A focused harness or extracted adapter can demonstrate the distinction. The purpose is to avoid assuming that manually predicting next state is automatically identical to observing committed state.

## A two-action trace

Start with schema S and a selected field. Suppose action A adds a field and action B changes a field label through the same captured send closure. The first callback prediction is reducer(S, A). The second prediction is reducer(S, B). React's eventual state, under sequential queued reduction, is reducer(reducer(S, A), B). The second callback need not include A's addition even though the final component state does.

The reducer can be completely pure and correct in all three calls. The discrepancy comes from observation timing and captured state, not from mutation inside the reducer. This distinction helps debugging: adding more cloning to the reducer would not address a stale closure used by the notification layer.

A proposed design could notify from committed schema changes through an effect, combine actions into one explicit transaction, or maintain a carefully defined state owner outside the component. Each changes callback timing and frequency. An effect can run for initial state or other changes unless guarded, and development lifecycle behavior needs consideration. The proposal should specify whether onSchemaChange means action attempted, predicted next schema, or committed schema observed.

## No-op actions and notifications

The reducer can return the original state for some no-op actions, such as selecting an unknown field or a move that leaves position unchanged. The component still calls onSchemaChange after send using next.schema. A consumer may therefore receive a notification even when the schema reference is unchanged, depending on the action path. Whether that should trigger autosave is a separate integration policy.

The current parent autosave hook reacts to schema identity changes supplied through its state path. A future event-driven persistence adapter might instead save on every callback and create unnecessary traffic for selection-only or no-op actions. Define what counts as a persistable schema change rather than assuming every builder action changes durable content. Selection is UI state; schema fields and title are content state; a move changes order; opening row details is local row state.

This classification can guide a proposed action audit. Record action type, whether schema identity changed, whether selection changed, and whether persistence should run. Do not use deep equality indiscriminately if stable reducer references already express no-op behavior, but do not assume reference changes always mean semantically important differences either. The chosen contract should be explicit and tested with representative actions.

## Publish button scope

The builder calculates schema issues and disables Publish when issues exist. Clicking an enabled button sets a status message saying the draft is ready to publish. It does not call the API publication endpoint in this component. The readiness gate and the actual publication repository are therefore separate boundaries.

A future integration should connect a deliberate publication action to the current schema, workspace authorization, route identity, slug policy, and server validation. It should also handle a schema changing while publication is in flight. The button's enabled state is useful feedback, but it cannot replace server checks or guarantee that the payload sent later is the same schema the user reviewed.

## Exercises

**FF-22A, eight points:** Construct the two-field text-3 collision and explain why a monotonically increasing count is insufficient for arbitrary initial schemas. Propose a local uniqueness policy and a different policy suitable for concurrent authors.

**FF-22B, six points:** Work the two-action captured-state trace and compare callback predictions with sequential reducer state. Define a precise onSchemaChange contract and the smallest characterization test needed to support it.

**FF-22C, six points:** Classify selection, no-op move, reorder, label edit, and details disclosure by schema effect and persistence need. Explain the current Publish button's actual effect and the additional boundaries required for real publication.

## Exit standard

A complete answer separates identity allocation, state transformation, observation, and persistence. Correctness in one layer does not automatically establish the others. The builder's reducer can remain a reliable pure function while an allocator creates a collision or a notification layer observes a stale prediction; those are distinct defects with distinct evidence and remedies.
