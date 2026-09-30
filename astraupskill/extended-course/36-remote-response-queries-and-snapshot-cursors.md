# 36. Remote response queries and snapshot cursors

The current queryResponses helper filters and sorts a supplied array, then finds an exact encoded timestamp/ID anchor. A missing anchor restarts at the beginning. This chapter designs a proposed remote query contract rather than pretending that local helper is already a database cursor. Read [responses.ts](../../packages/core/src/responses.ts) and [ResponseExplorer.tsx](../../apps/web/src/ResponseExplorer.tsx). Answers are in the [workflow review](review-12-journeys-flows-and-query-snapshots.md).

## Choose the browsing promise

A live query shows the current matching dataset as it changes. A snapshot query preserves a defined result population for a browsing session. Offset paging, keyset paging, and snapshot paging solve different problems and can be combined in different ways. Before selecting an encoding, decide what the user should observe when new responses arrive or old ones are removed.

For a live newest-first inbox, keyset continuation can avoid repeating newly inserted rows before the anchor, but it does not necessarily include every concurrent change exactly once. For an audit export, a stable snapshot may be more important than immediate freshness. The contract should state whether refresh starts a new view and whether the displayed total belongs to the same population as the pages.

The local helper's exact-anchor lookup is not a keyset predicate over an ordered database. If the anchor disappears, it starts again, which can repeat earlier rows. A remote adapter should not inherit that behavior accidentally unless the UI explicitly treats an invalid cursor as a reset. A structured stale-cursor response can be clearer than silently returning page one under a continuation request.

## Define a total ordering

The current sort uses submittedAt text and ID as a tie-breaker. A durable query needs an equivalent total order under its storage representation and collation rules. If timestamps are normalized ISO strings, lexical order can align with chronological order under the intended format; arbitrary mixed timestamp strings require more care. Database collation for IDs may differ from JavaScript localeCompare, so specify the ordering rather than assuming identical results.

For descending order, continuation selects records after the anchor in that descending order, including the tie-breaker. A predicate using only timestamp can skip or duplicate records sharing the same time. A unique immutable tie-breaker is essential. If an ordering field can change after submission, a record can move across the cursor boundary; either forbid that mutation for the query or define how it affects browsing.

The cursor should encode or reference sort direction and query scope. It can be opaque to clients while the server validates its version, filter identity, and snapshot identity. Signing a cursor can prevent tampering but does not authorize access to the underlying workspace. Authorization must still apply when the cursor is redeemed, particularly if permissions changed since the first page.

## Filters and totals belong together

Search currently examines stringified answer values in memory. A remote search implementation might use different case folding, tokenization, or indexes. If the UI promises the same behavior, test those differences explicitly. A database full-text search is not a drop-in equivalent to substring matching merely because both are called search.

Total should describe the filtered authorized population, not all workspace responses or only the current page. If count and page queries run at different times without a snapshot, they can disagree under concurrent writes. That may be acceptable for a live inbox if labeled approximate or current at separate observations, but a stable export contract needs stronger coordination.

Computing an exact total can be expensive for large or complex filters. A proposed API can return an estimated total, omit total, or provide hasMore, but the UI must reflect the chosen semantics. Do not return page length in a field named total and rely on the client to infer the distinction. The current local helper has enough data to calculate exact filtered length; a remote service may need a different explicit tradeoff.

## Cursor expiry and recovery

Snapshots and cursors can expire. The API should return a stable error category that tells the client to restart the query, preserving the user's filter and selection where possible. The client should not keep appending a fresh first page to old accumulated pages after expiry, because that mixes populations and creates duplicates.

A cursor can also become invalid after a schema or query-language version change. Include a version field or server-side cursor record so the adapter can reject unsupported interpretations. Avoid embedding raw respondent search text in logs or externally visible tokens without considering exposure. An opaque cursor can reference server state, while a self-contained token requires careful payload design and retention policy.

The UI's selected rows need a policy across refreshes. If a user selects response IDs for export and the query changes, decide whether selection remains, clears, or becomes a separate explicit selection set. A cursor is not an authorization token for selected records; the export operation must revalidate its own scope.

## A remote-query contract laboratory

Create a synthetic ordered dataset with several equal timestamps. Fetch a first page, insert a newer response, delete the anchor, and change the filter before requesting continuation. Compare the local helper's behavior with your proposed keyset or snapshot policy. The point is not to prove one strategy universally superior, but to make each strategy's observable promise explicit.

Add two workspaces with identical local response labels and ensure every query is scoped correctly. Test a cursor from workspace A used against B, a cursor with the opposite sort direction, an expired snapshot, and a revoked reader. These cases connect pagination to identity and authorization rather than treating it as pure list slicing.

The experiment can begin as a pure ordered-set model. A database integration must later verify actual collation, transaction snapshot behavior, query plans, and performance. Record the distinction. A passing array model cannot establish the storage engine's ordering or isolation, just as a database index cannot define the product's desired browsing semantics by itself.

## Exercises

**FF-36A, eight points:** Choose live or snapshot browsing and define total order, continuation, and deleted-anchor behavior. Explain how the current exact-anchor helper differs from your proposed remote contract.

**FF-36B, six points:** Specify filter, total, cursor scope, expiry, and authorization behavior. Include count/page inconsistency and a cursor reused under another workspace or sort direction.

**FF-36C, six points:** Build the equal-timestamp mutation scenario and identify model versus database evidence. Define how the client restarts after expiry without appending a new population to stale pages.

## Exit evidence

A cursor is a compact contract about identity, order, and observation time. Its encoding is the least interesting part if those semantics are undefined. A strong design lets the client explain exactly what a continuation means and how to recover when that meaning can no longer be honored.
