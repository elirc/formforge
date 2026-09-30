# 23. Durable draft compare-and-swap

The in-memory draft repository has a short, synchronous comparison-and-write sequence inside an async method. Replacing its Map with a database is not a matter of changing get and set calls to queries. This chapter develops a proposed durable adapter contract grounded in [drafts.ts](../../packages/data/src/drafts.ts). The existing implementation remains unchanged. Complete the exercises before the [durable repository review](review-09-durable-repository-contracts.md).

## Preserve the observable contract

The repository finds drafts by workspace and form, saves only when expectedVersion equals the current version or zero for an absent draft, increments version on success, and returns either saved with the new record or conflict with a copy of current. It clones schemas on input and records on output. These behaviors define what callers can observe; a durable adapter should state whether it preserves each one.

The in-memory method contains no await between reading current, comparing version, and setting the Map. Within one repository instance and ordinary JavaScript execution, another call does not interleave inside that synchronous span. A durable adapter that reads a row, awaits, compares in application code, and later writes can introduce an interleaving absent from the current implementation. The async interface alone does not provide mutual exclusion.

Write the two-writer counterexample. Both callers read version five. Both compare their expected five successfully. Caller A writes version six with schema A. Caller B writes version six with schema B. Both report saved, but A's work has been overwritten without a conflict. Merely wrapping the reads in helper functions does not change that outcome. The comparison and update must be enforced by the storage authority under concurrent execution.

## Conditional update as an atomic operation

A proposed relational adapter can issue an update constrained by workspace, form, and expected version, incrementing the version in the same operation. The affected-row count distinguishes a successful update from a failed precondition. This is a conceptual contract, not a database-specific query supplied by the current project. The chosen database and transaction isolation still determine exact behavior and error handling.

Creation requires its own race analysis. Two callers with expected zero can both observe no row. A unique key on workspace and form must ensure only one creates the initial draft. The losing caller should map the uniqueness conflict into the repository's conflict result rather than exposing a generic internal error. If the adapter instead allows duplicate logical drafts, future reads become ambiguous even though each physical row has a unique primary key.

Do not use only formId as the uniqueness scope. The interface deliberately includes workspaceId, and two workspaces can have forms with the same local ID. Conversely, using an arbitrary string concatenation without an unambiguous encoding can collapse distinct pairs. A database composite key expresses the pair directly; a key-value adapter needs a carefully defined tuple encoding.

## What does conflict current mean

After a failed conditional update, the adapter may read the current row to return it. Another writer can update the row between the failed attempt and that read. The returned current may therefore be newer than the exact version that caused the initial mismatch. This can be acceptable if the contract means a current snapshot observed during conflict handling, but the semantics should be stated.

If callers require the precise conflicting row from a single atomic observation, the adapter needs a transaction or database feature that provides it. Do not promise that stronger snapshot merely because the result type contains current. The in-memory implementation returns the record found during its synchronous comparison, while a durable adapter may have different timing unless designed to preserve it.

The distinction affects merge UX. A user may base a merge on the returned current and attempt another save with that version. A further conflict is normal if someone else edits in between. The UI should preserve the local proposal and explain that merge does not lock the draft. It should not automatically adopt the returned version and overwrite the server with an unchanged local schema.

## Transaction failures and uncertain outcomes

A database operation can commit while the client loses its response. The repository interface has saved and conflict results, but an adapter can also throw on transport or infrastructure failure. Such an exception does not always prove no write occurred. A caller that blindly retries the same schema and expected version may receive a conflict because the first attempt actually advanced the version.

For ordinary draft autosave, a recovery strategy can fetch current and compare it with the intended saved schema under a defined equality policy. That can help identify whether the desired state is present, but it does not necessarily identify which operation produced it. A stronger design could add a save operation ID and retained result, which changes the repository contract and requires its own idempotency rules. Keep that proposal separate from the existing expected-version mechanism.

Optimistic concurrency prevents overwriting an unexpected version; it does not by itself make retries return the original result. This is a central distinction. A conditional save can be safely rejected on retry while still leaving the client uncertain about whether its first attempt succeeded. The UI and autosave state machine must handle that uncertainty without labeling every exception as a known unsaved draft.

## Serialization and defensive copies

The in-memory implementation uses structuredClone to separate caller objects from stored state. A database naturally serializes values across a process boundary, but that does not automatically preserve the same type semantics. JSON cannot represent every value supported by structuredClone. The intended FormSchema is constrained data, so a durable adapter should validate or serialize according to that schema rather than assuming arbitrary JavaScript objects round-trip identically.

Return values also need ownership clarity. An ORM entity tracked by a unit of work can have mutation behavior different from a detached record. The adapter should return a representation consistent with the readonly contract and avoid exposing a mutable shared cache object that another caller can alter. TypeScript readonly declarations prevent some compile-time assignments; they do not freeze runtime objects or establish cross-caller isolation.

Timestamp policy deserves the same attention. The current repository accepts an injected clock and stores ISO text. A durable adapter might use a database clock. Choose one authority and define test control. If created or updated times participate in ordering, distinguish clock order from version order; a monotonic version can advance even if a wall clock moves backward.

## A contract-test plan

Design adapter tests that run against two independent repository clients sharing one isolated store. Test concurrent create with expected zero, concurrent update with the same expected version, isolation between workspaces, a stale expected version, and mutation of returned or input objects. A test using two references to one fake Map adapter cannot establish database concurrency behavior.

Add a controlled uncertain-response scenario if the adapter can support it: commit a save and then fail the response path. Verify that recovery does not overwrite a newer third-party edit. Record whether this is a fault-injected model or a real driver-level experiment. The evidence should identify the storage engine, transaction setup, and cleanup ownership when those components are involved.

The course does not require installing a database or running this plan against live data. Your deliverable is the contract, race trace, and precise experiment design. A future implementation can choose the smallest environment that crosses the boundary its claims depend on.

## Exercises

**FF-23A, eight points:** Trace the naive read/compare/write race and design atomic create/update operations with workspace/form uniqueness. Explain why an async method and a unique physical row ID are insufficient by themselves.

**FF-23B, six points:** Define conflict-current timing and uncertain-save recovery. Distinguish optimistic concurrency from idempotent result replay, and preserve the user's local proposal during another conflict.

**FF-23C, six points:** Write the durable adapter contract-test plan, including two independent clients, copy isolation, timestamp authority, and one accepted-but-response-lost case. State which checks cannot be established by an in-memory fake.

## Exit evidence

A correct durable adapter preserves the repository's meaning under the interleavings introduced by real I/O. The important question is not whether it implements the same method names, but whether its authority can enforce the same conditional effect when independent callers race and responses become uncertain.
