# 09. Page flow history and resumption

A multi-page form needs more than a current array index. Branches can skip pages, terminate early, or revisit a page. The respondent's history is therefore an execution path, not necessarily a prefix of the configured page list. [flow.ts](../../packages/core/src/flow.ts) makes that distinction visible through currentPageId, visitedPageIds, answers, and completed.

## Starting establishes a small invariant

startSession selects the first configured page and throws if there are no pages. It begins with empty answers, a one-element visited path, and completed false. That constructor does not validate every page identity, branch destination, or field assignment in the entire flow. A successful start proves there is a first page, not that every future transition is valid.

This distinction helps design tests. An empty-flow test establishes the immediate constructor boundary. A missing branch target test belongs to nextSession, where the selected target is checked. A future flow validator could catch more errors before any respondent begins, but it should be described as an added boundary rather than credited to startSession.

answerSession creates a new answer record by spreading the old answers and setting one field. It does not inspect the flow, verify that the field belongs to the current page, or reject edits after completed. That is the current pure function's scope. A UI may impose additional reachability rules, but those require caller inspection and tests.

## The first matching branch wins

nextSession first returns the same session if completed is already true. Otherwise it finds the current page index and rejects an unknown current page. It uses find over branches to locate the first branch from that page whose condition evaluates true. If a matching branch exists, its target controls the next step. If none exists, the next configured page is selected, or null at the end.

Branch order therefore matters when conditions overlap. Suppose page role has two branches: one matching engineering goes to consent, and another matching any answered role goes to details. An engineering response satisfying both follows the first matching branch in array order. The function does not choose the most specific condition or combine destinations. A course exercise should make both conditions true so order is observable.

A null target completes the session without appending a new page id. A nonnull target must name a configured page and is appended to visitedPageIds. The code does not reject a revisit or detect navigation cycles here. A flow can revisit pages if configured branches cause it; bounded progression is a separate product requirement.

## Back follows visited history

backSession removes the final entry from visitedPageIds when at least two entries exist and sets currentPageId to the new last entry. It also sets completed false. It does not compute the previous page by subtracting one from the configured page index.

Work pages contact, role, consent, details. A branch from role to details skips consent. The visited path is contact, role, details. Back returns to role, not consent. That is the point of storing the actual path. If a user changes an earlier answer, a future Next may take a different branch; the function follows current answers at that time.

Answers are retained when moving backward. The helper does not automatically clear responses from skipped or no-longer-visible pages. This matters for submission policy. Hidden or unreachable answers may need to be omitted, retained for convenience, or explicitly reviewed depending on the product. Navigation alone does not determine which answers are accepted for final submission.

There is a small completion edge case worth characterizing. If a one-page session completes while visitedPageIds still has length one, backSession returns the same session immediately and leaves completed true. With a longer history, Back can clear completed as it pops the path. A generic statement that Back always reopens a completed form would therefore exceed the source.

## Resumption validates a subset of consistency

serializeSession uses JSON.stringify. resumeSession parses unknown JSON and checks that currentPageId belongs to the supplied flow, visitedPageIds is a nonempty array of known page ids, completed is boolean, and answers is a truthy object whose values are undefined, strings, or booleans. It returns a reconstructed object or undefined on failure.

Those checks do not establish every semantic invariant. The current page need not equal the last visited page under the visible validation. The path need not correspond to legal branch transitions. Answers need not refer only to current schema fields. The object check does not explicitly exclude arrays, so an answer array containing allowed primitive values can satisfy this narrow branch. These are characterization opportunities, not features to silently fix while writing documentation.

A robust future resume format might include a schema or publication identity, format version, and consistency checks for current/history agreement. It must decide how to handle a changed flow: reject, migrate, or preserve a recoverable answer buffer. Silently resuming against a new flow with reused page ids can produce plausible navigation while changing the meaning of saved answers.

## Debugging a skipped-page report

A respondent reports that Back went to the wrong page. First capture the actual visited path and branch outcomes, not just the configured pages. If a branch skipped consent, returning from details to role can be correct. If a malformed resumed session claims current details but has history contact, consent, the inconsistency may originate at resumption rather than Back.

Use symbolic ids and a fixed answer set in the reproduction. Show the first matching branch and the exact path after each transition. A screenshot of the current page cannot reveal the history invariant. A useful incident note identifies whether the report contradicts the configured flow, the stored session, or the user's expectation.

**FF-09A, eight points:** Trace first-match branch selection with overlapping true conditions, a null completion target, and a missing target. Record current page, visited path, and completed after each attempted transition.

**FF-09B, six points:** Compare Back after a skipped page, after a multi-page completion, and after a one-page completion. State which answers remain and why page order alone is insufficient.

**FF-09C, six points:** Create three malformed but parseable resume candidates that target different missing consistency checks. Propose a versioned resume contract and explain how changing a publication affects it.

Review in [the flow and response guide](review-04-flow-and-response-evidence.md), then examine [response paging and export](10-response-cursors-and-csv-boundaries.md).
