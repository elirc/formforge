# 16. An executable save ledger with explicit limits

The [save-ledger model](labs/save-ledger.cjs) isolates one lesson from useAutosave: an earlier successful result can advance committed-version knowledge while remaining ineligible to replace the latest status. It deliberately omits React, timers, the promise queue, API calls, and schema storage. Its value is a small reproducible counterexample to two plausible wrong policies.

Run the bounded model checks from this course directory:

```powershell
node --test labs/save-ledger.test.cjs
```

Node's built-in runner is the only requirement for this model. It performs no network or filesystem writes and imports no application module. A pass is a model result, not a new pass count for the application's Vitest suites. The actual hook and tests remain [here](../../apps/web/src/useAutosave.tsx) and [here](../../apps/web/src/useAutosave.test.tsx).

## Read the complete state

The model keeps latest, committed, and status. edit increments latest and marks queued. settle advances committed only for a saved result. It changes status only when the supplied result id equals latest. The input state is copied rather than mutated, making before/after ledgers easy to retain.

Start at latest zero, committed zero, idle. Apply edit twice. The resulting latest is two and status queued. Settle result one as saved version one. Committed becomes one while status remains queued. The three values deliberately refer to different facts: latest local edit, latest accepted version known through this schedule, and visible state for current work.

The first wrong policy is discard all data from stale results. That would keep committed zero, so a later saver could use an obsolete version. The second wrong policy is display every success. That would mark current work saved even though edit two remains pending. The model demonstrates why result processing can have both unconditional knowledge updates and conditional presentation updates.

## Model assumptions must be visible

The model does not enforce the hook's serialized save queue. It assumes the caller supplies a schedule consistent with the scenario being studied. Feeding arbitrary out-of-order saved versions can make committed move backward because settle assigns the supplied version. The real hook's intended serial queue limits which schedules occur, but a future adapter or refactor must preserve that assumption.

The model also does not validate ids or version values, store schemas, represent a route session, or distinguish network uncertainty from a current error. Those omissions keep the exercise focused. They would be unacceptable if this module were advertised as a production editor state machine. Do not import it into the application as a shortcut.

A strong learner names assumptions before extending the model. For example, adding a max operation around committed might prevent numerical regression while hiding an invalid schedule or mismatched form identity. A larger number from another form is not necessarily better knowledge. Identity and sequence policy should be designed together rather than patched with arithmetic.

## Extend through an owned answer file

Keep the supplied reference intact. Create a separate answer module and test file for your extension. Choose one of three tasks: add active form identity, model the queue of pending payloads, or represent current transport uncertainty. Each task should retain the stale-success distinction already established.

For form identity, bind result to workspace/form and session generation. A late result for another session must not update committed for the current form. For queue modeling, ensure the next request reads the committed version only when it actually starts. For uncertainty, distinguish request rejection from a response lost after possible acceptance; do not label both as a known conflict.

Use symbolic payload names A and B. There is no need to copy a whole FormSchema into this first model unless your extension concerns schema ownership. Keeping the state small makes counterexamples readable and avoids mistaking large fixtures for stronger proof.

## Connect each model claim to source

The hook advances requestSequence on edit handling, updates version.current on saved result, compares requestId with latestRequest before presenting completion, and serializes saver callbacks through queue.current. The model includes the first three ideas in simplified form and omits the fourth. A source-to-model table should explicitly show that omission.

The existing hook tests use fake timers and deferred promises to test the omitted scheduling mechanism. That is why the model supplements rather than replaces them. A new integration needs the real component and adapter behavior too, especially loaded-version initialization and route switching. One pure model cannot certify those paths by naming its events after them.

## Independent practice

**FF-16A, eight points:** Write the state ledger for two edits followed by old success, old conflict, and latest conflict in separate fixtures. Explain which field changes in each and why.

**FF-16B, six points:** Implement one extension in a new answer module and show a counterexample against a plausible wrong policy. Preserve the reference and avoid application imports.

**FF-16C, six points:** Produce the source-to-model mapping and an evidence ladder from model to hook test to API integration. Identify at least three omitted guarantees.

Check [the operational/model review](review-07-models-operations-and-api-tests.md) after attempting the model work. Continue with [operational events](17-readiness-request-identity-and-events.md).
