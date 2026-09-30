# 15. Optimistic comments and recovery drafts

An optimistic interface displays a proposed result before its asynchronous operation succeeds. FormForge's CommentsPanel is a compact example: it adds a pending comment, clears the composer, then replaces or removes that comment when createComment settles. The interesting questions concern identity and what the user may type while a request is still pending.

Read [CollaborationPanel.tsx](../../apps/web/src/CollaborationPanel.tsx), [comments.ts](../../packages/data/src/comments.ts), and [the component tests](../../apps/web/src/CollaborationPanel.test.tsx). Keep the default demo callback distinct from the repository implementation. The panel accepts an injected function, but the default does not invoke the repository automatically.

## The optimistic record has a temporary identity

submit trims body and returns immediately for empty text. It creates temporaryId from pending plus Date.now, builds a pending view, appends it using a functional state update, clears body, and clears the error. It then awaits createComment(text). On success, it maps the current list and replaces entries whose id equals that temporary id with the saved comment.

The temporary identity joins the asynchronous result to the optimistic row. It is not the saved repository id. A correct test uses different temporary and returned ids and asserts that the saved row replaces the intended pending row without adding a duplicate. If every fixture uses one row and the same id, an implementation that merely replaces the entire list could pass while losing concurrent comments.

Date.now is not a uniqueness proof for multiple submits in the same millisecond. The current UI does not disable the submit button while a prior request is pending. A characterization fixture with a fixed clock can expose collisions. The appropriate teaching response is to define a stronger attempt-identity proposal and test concurrent submissions, not to claim a collision happens on every ordinary click.

## Success should preserve unrelated changes

The success branch uses a functional updater over current comments. That preserves rows added while the request was in flight and replaces matching temporary ids. This is better evidence than a closure-based setComments using the original list. However, if temporary ids collide, the matching predicate can replace more than one row. Identity quality and update style both matter.

A proposed UUID or monotonically scoped counter can provide a stronger local attempt id. The generator should belong to the component or adapter's intended lifetime and be testable without wall-clock races. Saved server identity still comes from the response, and a retry protocol may require retaining attempt identity separately from the UI row key.

## Failure restores one submitted text

On failure, the panel filters out the temporary row, sets body back to the submitted text, and displays a retry message. This protects that failed submission from simply disappearing. But the composer may have acquired newer text while the first request was pending. Unconditionally restoring the old text can overwrite that newer local draft.

Work a schedule. Submit A, clearing the composer. Type B without submitting it. Reject A. The catch sets body to A's text, replacing B in the current implementation. This is a concrete race for a proposed recovery improvement. It resembles the autosave status problem but affects a content buffer rather than a label.

A better product policy might retain failed text in a separate retry row, restore it only if the composer is still empty and belongs to that attempt, or offer an explicit recover action. Each option needs acceptance cases for newer unsent text and multiple failed submissions. Automatically concatenating drafts is not necessarily correct either; it changes the user's intended comment boundaries.

## The repository has another ownership boundary

InMemoryCommentRepository rejects a blank trimmed body, increments its sequence, stores a trimmed body and parsed mentions, and returns a structured clone. list filters by both workspaceId and formId and returns cloned records. This demonstrates local isolation by lookup parameters and defensive copies, not authenticated access to those parameters.

Author is supplied in CreateCommentInput. The repository does not derive it from a trusted principal. A production comment endpoint should obtain actor identity from its authorization boundary and prevent callers from impersonating another author by editing the body. The current repository can still be a useful persistence adapter behind that future boundary.

The list method preserves stored array order after filtering. It does not offer pagination, explicit timestamp ordering, or a stable cross-process id. A durable adapter needs to define those contracts if the UI begins relying on them. The string comment-one pattern is local sequence allocation, not a globally unique distributed identifier.

## Retry and mention delivery remain separate features

The create interface has no idempotency key. If a remote adapter creates a comment but the response is lost, retrying can create another record unless a stronger protocol is added. A UI message saying try again is therefore not sufficient to prove safe retry under uncertain remote outcomes.

Mention parsing also does not deliver notifications. A future comment-plus-notification workflow must decide whether storing a comment and creating notification intents share an atomic boundary. The recipient delivery can happen later, but its retries need stable identity. Keep that system design separate from the panel's local optimistic row replacement so each layer has a clear acceptance test.

## Independent practice

**FF-15A, eight points:** Trace two concurrent optimistic submissions with distinct ids and reversed completion order. Then fix the clock to force a temporary-id collision and characterize the wrong association.

**FF-15B, six points:** Reproduce submitted A, typed B, rejected A. Propose a recovery UI that preserves both pieces of user work and specify the exact composer and list states.

**FF-15C, six points:** Design a trusted comment adapter with stable retry identity and separately queued mention delivery. Identify which current repository guarantees can be reused and which must be added.

Use [the separate review](review-06-browser-storage-and-optimism.md) after drafting the schedules. Return to [the course route](README.md) for additional integration and operational modules.
