# 04. Autosave has a local sequence and a server version

The most interesting autosave error is not always a lost network request. Sometimes an older successful request tells the truth about itself while producing a false message about the user's current work. FormForge's hook separates the local request sequence from the last committed server version so it can preserve both kinds of truth.

Read [useAutosave.tsx](../../apps/web/src/useAutosave.tsx) and [its tests](../../apps/web/src/useAutosave.test.tsx). The tests use fake timers and manually resolved promises. That combination controls the debounce deadline independently from completion of the save operation. Replacing it with arbitrary sleeping would obscure the race we want to explain.

## Four moments in one save

A local edit schedules work. Its debounce timer expires. Its queued callback reaches the front of the promise chain. Its save promise resolves or rejects. These moments are not interchangeable. Another edit can occur between any two of them, and the UI's latest work can differ from the request currently running.

The hook increments requestSequence when its effect handles a subsequent schema change, before the debounce timer fires. It records that value as latestRequest and displays queued. This is what prevents a still-running old request from presenting a saved message during the new edit's debounce interval. If sequence advancement waited until the timer fired, there would be a window where the old result still appeared current even though the user had changed the form.

The first effect run is skipped using mounted. The hook begins with version zero and does not load an existing server version itself. A future real API integration must account for that initialization rather than assuming the hook has inferred a loaded draft's version. The displayed idle wording is not evidence that an existing server draft was fetched.

## Work a deterministic schedule

Use the test harness delay of three hundred milliseconds. Edit A at time zero. At time three hundred, its timer expires and its save begins with expected version zero. Keep that promise unresolved. Edit B next, which immediately makes the current status queued and gives B a new local request id.

One hundred milliseconds into B's debounce, resolve A as saved version one. The hook first updates its committed version ref to one. It then compares A's request id with latestRequest. Because B superseded it, A does not change the displayed state. The user still sees queued, which is accurate for B. When B's remaining two hundred milliseconds expire, its callback eventually sends B with expected version one.

There are two correct observations here: A's accepted version must be retained for the next save, and A's status must not claim that B is saved. A simplistic ignore-all-stale-results rule would throw away the version advancement too. A simplistic always-display-success rule would erase the pending state. The right behavior depends on which part of the result is authoritative for which purpose.

## Serialization happens through the promise chain

If B's timer expires while A is still pending, the hook appends B's callback to queue.current. The callback reads version.current when it runs, not when the timer was initially scheduled. That lets B use A's accepted version after A completes. The timer may already display saving while the actual network callback waits behind A; the UI label is broad, not a count of simultaneous HTTP requests.

Suppose A returns conflict instead. The hook does not advance version.current from a conflict result. If B is now latest, A's conflict message is suppressed, and B later sends using the still-committed version. The existing test deliberately expects version zero in that case and lets B's own conflict surface. Automatically adopting the serverVersion from A's conflict would change this contract and could enable an unreviewed overwrite.

A rejected promise is caught on the queue chain. Only the latest request displays error. The catch also settles the chain so later queued work is not permanently blocked by an earlier rejection. A learner should trace both user feedback and queue liveness: a hook that displays an error but leaves a permanently rejected tail could appear recoverable while never executing later edits.

## Cleanup is narrower than cancellation

The effect cleanup clears its timer. It does not cancel a save that has already started, abort an HTTP request, or remove work already appended to the promise chain. The hook does not expose a route identity reset or a cancellation token. These are important limits for a proposed integration, particularly when switching between forms.

Do not add an exercise that assumes effect cleanup undoes server writes. If a request already committed and its response is lost, canceling local observation cannot erase that commit. A future API adapter needs a policy for uncertain results and a component lifetime that prevents one form's completion from becoming another form's state. That proposal deserves its own acceptance tests.

## Debugging with observable events

Record a ledger entry when an edit occurs, a timer fires, a saver is invoked, a saver completes, a committed version advances, and a status changes. Give requests names A and B instead of relying on identical payload objects. The ledger should make it possible to answer why the second call used version one without consulting a screenshot.

Use assertions that distinguish the mutation you fear. To detect late sequence advancement, resolve A during B's debounce and assert queued. To detect stale-result version loss, assert B's expected version. To detect concurrent execution, expire both timers and assert only one saver call before resolving A. One final Saved version two assertion cannot isolate all three behaviors.

**FF-04A, eight points:** Draw the six-event schedule where A completes during B's debounce. Record the committed version and visible state after every event. Explain why those values can refer to different edits without being inconsistent.

**FF-04B, six points:** Replace A's success with conflict, then with rejection. Predict B's expected version and whether later work still executes. Distinguish the state label from actual saver invocation.

**FF-04C, six points:** Design a form-switch acceptance test for a proposed API adapter. Specify form identity, pending request ownership, loaded version initialization, and what happens to an uncertain old write. Do not claim the current hook implements the proposal.

Answers and review criteria are in [the scheduling guide](review-02-scheduling-and-integration.md). Continue with [snapshot and retry incidents](05-publication-and-retry-incidents.md).
