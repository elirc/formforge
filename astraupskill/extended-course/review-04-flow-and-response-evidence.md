# Review 04. Flow history, cursors, and export claims

## FF-09A: branch order is part of behavior

Hint: find chooses one branch; it does not rank all matching branches.

When two conditions from the current page are true, the first matching branch in array order wins. A null target marks completed and retains currentPageId and visited history. A nonnull missing target throws before appending it. If no branch matches, the next configured page is chosen, or completion at the end. Award four points for branch/default outcomes and four for exact state changes.

A test should use distinct target ids and conditions that are simultaneously true. Testing only mutually exclusive branches cannot expose a refactor that changes precedence. Likewise, a missing-target test should ensure its condition actually matches; an unreachable invalid target does not exercise nextSession's selected-target guard.

## FF-09B: Back retraces actual visits

Hint: use the path array rather than the page configuration.

After contact, role, details with consent skipped, Back returns to role. After completion with a history longer than one, Back removes the last visited entry and clears completed. With a one-element history, Back returns the original session immediately, so a completed one-page session remains completed. Answers are retained in these transitions.

Award two points for each case. A proposed Back-from-completion behavior could choose to reopen the current page rather than pop, but that would change the current helper and needs a deliberate test. Do not rewrite your prediction to match a familiar wizard interface that this source does not implement.

## FF-09C: parseability is not path consistency

Hint: compare currentPageId with the final visited id and ask whether every history edge was legal.

A candidate can use known page ids while current differs from the history tail. It can contain a known-id history that no configured branch/default sequence would produce. Its answers can contain unknown field keys, and the broad object check can accept arrays with allowed value types. Any three distinct examples with source-grounded explanations satisfy the characterization part.

A proposed versioned format should bind the session to an intended schema/publication, validate structural and semantic consistency, and define migration or rejection when that source changes. Award three points for counterexamples and three for the proposal. A rejection should preserve a recoverable answer artifact where product policy allows, rather than silently claiming the respondent never entered data.

## FF-10A: total is not remaining rows

Hint: compute the full filtered order before locating the cursor.

With A and B tied and C later, oldest gives A, B, C and newest C, B, A. An oldest page of one returns A, total three, and A's cursor. Reusing that cursor in newest mode locates A at the end, so the returned page is empty while total stays three. This is a direct consequence of finding the anchor in the newly sorted collection.

Award four points for orders and counts and four for cursor behavior. If a fixture adds a search filter, total must count the filtered population rather than all input records. A test that equates total with items.length on every case cannot detect a total-scope regression.

## FF-10B: the current cursor is an anchor lookup

Hint: unknown means findIndex minus one, so start is zero.

Absent or unknown cursors start from the beginning. Deleting the anchor from the current input has the same lookup consequence. Changing search can remove the anchor and restart, or retain it in a changed population. The current token is not query-bound and does not execute a strict tuple resume predicate.

A stricter proposal could bind query/sort identity and reject mismatches, or the client could deliberately reset cursors whenever those inputs change. A true keyset API would need a storage order and resume predicate with compatible comparison rules. Award three points for current behavior and three for a coherent proposal with limits.

## FF-10C: preserve structure and describe mitigation precisely

Hint: apply the leading-character guard before CSV quote escaping.

A comma-containing value is quoted. An embedded double quote is doubled inside a quoted cell. Multiline text is quoted. Undefined becomes empty text; false becomes the text false. A value beginning with equals gets a leading apostrophe, and may also be quoted if it contains a CSV-special character. Header field ids pass through the same encoder.

Award four points for exact transformations and two for limits. The anchored formula-like guard does not inspect every possible spreadsheet interpretation or normalize leading whitespace. Do not claim universal spreadsheet safety without testing the intended consumer and import settings. The code's exact transformation is still valuable evidence when its scope is stated honestly.

These six exercises add one hundred twenty points to the developing course assessment. Keep model outputs distinct from browser and spreadsheet consumer observations. Return to [the route](README.md) with your counterexample fixtures and a clear list of proposed contract changes.
