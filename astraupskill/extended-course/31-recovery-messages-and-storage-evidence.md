# 31. Recovery messages and storage evidence

The resilience components display reassuring messages, but the messages themselves do not implement persistence or offline replay. This chapter separates recovery UI from storage authority using [Resilience.tsx](../../apps/web/src/Resilience.tsx), its [tests](../../apps/web/src/Resilience.test.tsx), and the current [autosave hook](../../apps/web/src/useAutosave.tsx). The objective is to design truthful recovery behavior, not to edit the application during the exercise. Answers are in the [presentation review](review-11-presentation-and-recovery-evidence.md).

## What the error boundary owns

The ErrorBoundary stores a failed boolean. A render failure sets it true, causing a fallback view with a Reset view button. Clicking the button sets failed false and attempts to render the children again. The boundary does not serialize a schema, write browser storage, query the draft repository, or restore an autosave queue.

Its fallback says the draft remains stored. That statement requires evidence from another owner; it is not established by the boundary's implementation. A render crash can occur while a draft exists only in component memory, while a save is queued, after a save succeeded, or after a conflict. A single unconditional storage claim does not distinguish those histories.

The existing test throws during render and verifies that the fallback heading and reset button appear. It does not click Reset against a recovered child or verify draft persistence. This is useful containment evidence with a narrow scope. A test name about resilience should not be interpreted as proof of every recovery promise printed in the fallback.

## Reset is not restoration

If the child still throws, resetting the boundary can immediately lead back to the fallback. If the child remounts, its local state may be reinitialized. Whether a draft survives depends on where the draft is owned and how the child restores it. A parent store, browser storage, server draft, and in-memory component state each have different lifetimes.

A proposed recovery design should identify a durable or at least independently owned draft record before promising preservation. The fallback can show the last confirmed save version and distinguish it from newer unsaved edits if the state owner exposes that information. If the system cannot know, the message should say what recovery can attempt rather than asserting certainty.

Do not make the error boundary responsible for every persistence concern. A better separation may place draft ownership outside the crashing view and let the boundary consume a recovery summary. That summary needs its own update policy so it does not become stale or disappear with the same subtree. The design should specify what survives a view reset, route change, browser reload, and full browser close.

## Browser online state is a hint

NetworkStatus initializes from navigator.onLine and listens for online and offline events. It displays a banner when the browser reports offline and removes it when the browser reports online. It does not probe the FormForge API, test workspace authorization, inspect a save queue, or verify that the server is ready.

An online browser can still fail to reach the API because of DNS, routing, server failure, expired credentials, or an application error. An offline signal can be useful feedback, but it is not a complete connectivity diagnosis. A proposed connectivity model can separate browser network hint, API reachability, authentication status, and pending-save state. Avoid treating a green network indicator as proof that the latest draft is durable.

The banner says draft edits stay local until connection returns. The component itself does not create a local queue or implement replay. The autosave hook manages debounced and serialized save calls, but the source does not become a durable offline outbox merely because the banner mentions local edits. A production offline feature must define storage, retry identity, conflict handling, and recovery after browser termination.

## Design an offline draft ledger

A proposed local ledger can record workspace/form identity, base server version, local schema, operation identity, and last confirmed server result. It should distinguish a draft currently edited in memory from one successfully persisted to browser storage and from one confirmed by the server. These are three acceptance levels with different failure modes.

If browser storage fails because of quota or access restrictions, the UI must not continue saying the draft is locally saved. A recoverable response could offer an explicit export or preserve the in-memory draft while warning about the missing local durability. The policy should avoid overwriting a newer local record with an older delayed save result and should bind records to the correct workspace/form.

On reconnect, replaying the local schema with its original expected server version can conflict with another editor's changes. That conflict is not solved by changing the expected version to the latest value. The user needs a merge or deliberate replacement policy. Earlier chapters' save ledger and three-way identity reasoning provide a starting point, but a full offline feature must persist enough base information to support the chosen merge.

## Crash and reconnect schedules

Write four timelines. In the first, a render error occurs before the debounce fires. In the second, a save is in flight and the view resets. In the third, local storage succeeds but the server is unreachable. In the fourth, the server accepts the save but its response is lost before the browser crashes. For each, identify which owner retains evidence and which recovery statement is justified.

The last case is particularly important. On restart, the client may have a pending local operation while the server already contains its effect. Expected-version conflict can reveal that something changed, but it does not automatically identify the original operation's success. A recovery read or a stronger idempotent save protocol is needed according to the chosen contract. Do not label the pending local record definitely unsaved merely because no response was recorded.

A pure model can verify state transitions under these schedules. Browser storage tests can verify serialization and quota/error handling in a controlled environment. A real network integration can verify reconnect and server conflicts. Report those evidence levels separately. No single test that toggles navigator.onLine can establish all of them.

## Exercises

**FF-31A, eight points:** Trace what ErrorBoundary owns and what its stored-draft message assumes. Compare reset against a still-broken child, a remounted child with local state, and a child backed by an external draft owner.

**FF-31B, six points:** Design a connectivity and save-state model separating browser online hint, API reachability, local persistence, and server confirmation. Explain why the current NetworkStatus test proves only banner behavior.

**FF-31C, six points:** Complete the four crash/reconnect timelines and propose an offline ledger. Preserve workspace/form identity and base version, handle local-storage failure, and avoid silently overwriting a server conflict.

## Exit evidence

A recovery message is a promise about retained evidence. The strongest design makes that evidence explicit and lets the UI state only what its owner can justify. Reassuring wording without storage and conflict semantics can make a failure more confusing by encouraging users to discard the only remaining copy of their work.
