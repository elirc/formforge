# 14. Local resumption and component lifetimes

The pure flow helpers describe navigation, but the browser decides when to load, save, reset, and remount them. [MultiPageForm.tsx](../../apps/web/src/MultiPageForm.tsx) stores a ResponseSession in localStorage and renders one page at a time. This creates real local persistence behavior alongside the demonstration API seams from the previous chapter.

## Loading is an initializer, not a continuous subscription

loadSession reads the storage key, attempts resumeSession, and falls back to startSession when the stored string is absent or invalid under the resume helper. useState receives this loader as its lazy initializer. That initializer runs for component initialization; it is not automatically rerun every time flow or storageKey props change on an already-mounted instance.

The effect writes serializeSession(session) whenever session or storageKey changes. This combination creates a prop-change question: if an existing instance receives a new storageKey without being remounted or resetting state, its current session can be written under the new key. A future multi-form integration must define component identity or explicit reset behavior rather than assuming a new key triggers a load.

This is a proposed integration concern, not a claim that every current navigation path produces the race. Reproduce the component with controlled prop rerendering to characterize it. Then inspect the real parent keying and route lifetime before describing user-visible impact.

## Storage access can fail before parsing

resumeSession catches JSON parsing and validation failures inside its own function. loadSession calls window.localStorage.getItem outside that catch. The saving effect similarly calls setItem directly. Browser storage access can fail for environmental reasons, and the current component does not wrap those calls in its own recovery policy.

A robust extension needs to distinguish unavailable storage from malformed stored content. Malformed content may permit starting a fresh session with a recoverable copy. Unavailable storage may require keeping the active session in memory and telling the user resumption is not available. Silently showing progress saved on this device after writes fail would overstate the result.

The ErrorBoundary elsewhere in the app is not proof that every storage failure preserves progress. Its fallback text says the draft remains stored, but the boundary does not inspect this localStorage write or perform a persistence operation. A component test should establish the actual lifecycle and retained buffer under the chosen failure, and a product change should make the message depend on evidence.

## Page schema follows form field order

The component finds the current page by id and constructs pageSchema by filtering schema.fields for ids included in page.fieldIds. Filtering preserves the order of the original schema fields. It does not reorder fields to match page.fieldIds. If a page lists ids B then A while the schema lists A then B, the rendered page schema still follows A then B.

That may be acceptable if pages only assign membership and the form schema owns ordering. It would be incorrect to claim page.fieldIds is the ordering authority without checking the implementation. A specification should choose one authority. Duplicating ordering rules across both arrays invites inconsistent edits and difficult migrations.

Fields absent from the schema do not appear merely because their ids are listed on the page. The component does not synthesize missing fields. A future flow validator can report dangling references before rendering; otherwise a page may contain fewer controls than its configuration suggests.

## Remounting the renderer resets its local page state

FormRenderer is keyed by session.currentPageId and receives initialAnswers from the session. A page-id change therefore creates a new renderer instance for that page. This helps align local form control state with the selected page's answer snapshot. It also means assumptions about in-place prop updates should be tested at the actual key boundary.

advance merges defined entries from pageAnswers into the session one at a time, then calls nextSession. Undefined values are skipped rather than explicitly deleting an existing answer. If a future control represents clearing as undefined, that distinction matters: old answers can remain unless the chosen clear operation uses a value or action with explicit semantics.

The completion screen calls the state locally saved and offers Start over, which constructs a new session. The persistence effect then writes that state. It does not submit the session to the API or delete every historical browser artifact. The meaning is local response progression under the current storage key.

## Progress is configured position, not guaranteed remaining work

The progress label uses pageIndex plus one over flow.pages.length. A branch can skip pages or complete early. Therefore Step two of three can lead directly to completion under the demo branch. The progress indicator reports position in the configured list, not a prediction that exactly one page remains for every answer path.

A proposed adaptive progress UI could calculate reachable paths or use completed milestones, but branch conditions and revisits complicate a single percentage. Define what the indicator promises before adding arithmetic. An honest step label can be better than a precise-looking percentage that moves backward unexpectedly without explanation.

## A deterministic lifetime laboratory

Use a component fixture that starts with storage key A and a saved session on page role. Rerender with key B, whose storage contains a different session. Predict whether the existing component reloads B or writes its current session under B. Then repeat using an explicit React key that forces remount. The contrast isolates lifetime behavior without needing a network server.

Keep storage mocks scoped and restore them after the test. Do not use the user's actual browser progress. A fixture should assert exact reads and writes plus visible page state, because a rendered page alone may not reveal that another storage key was overwritten.

**FF-14A, eight points:** Trace initial load, invalid serialized content, storage access exception, and storage-key prop change. Separate pure resume validation from browser storage access.

**FF-14B, six points:** Predict page field order for conflicting schema/page arrays and explain undefined-answer merging. Propose explicit ownership for order and clearing semantics.

**FF-14C, six points:** Design the rerender-versus-remount laboratory and an adaptive-progress specification. Mark which behavior is current and which requires a new component contract.

Review with [the browser-boundary guide](review-06-browser-storage-and-optimism.md), then continue to [optimistic comments](15-optimistic-comments-and-recovery-drafts.md).
