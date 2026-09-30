# 30. Response explorer view and export consistency

The response explorer displays a growing set of local pages while exporting all locally supplied matches. This chapter studies that relationship in [ResponseExplorer.tsx](../../apps/web/src/ResponseExplorer.tsx) and the query/export helpers in [responses.ts](../../packages/core/src/responses.ts). It extends the earlier cursor chapter by focusing on component state, representation, and a proposed remote-data contract. Answers are in the [presentation review](review-11-presentation-and-recovery-evidence.md).

## What Load more actually does

The component keeps search, sort, and pageCount in state. On each render it starts with no cursor and repeatedly calls queryResponses up to pageCount times, appending each page's items to a visible array. Clicking Load more increments pageCount. The component is not fetching a new server page or retaining an opaque remote cursor across renders; it recomputes a prefix of the current local result set.

This is appropriate for a small supplied array and makes search or sort changes easy to recompute. Those controls reset pageCount to one. However, increasing pageCount also repeats filtering and sorting work in each helper call, because each page query receives the full responses array. A proposed optimization could query once or memoize a sorted filtered view, but it should preserve the helper's ordering and cursor semantics.

Do not call the current UI infinite server pagination. The network, cache, and consistency requirements of that feature are not implemented here. The existing test verifies six visible rows, then twelve after Load more, using a fixed fixture. It does not establish behavior while a remote dataset changes between page requests.

## Prop changes alter the recomputed prefix

If the parent supplies a new responses array while pageCount is greater than one, the component recomputes that many pages from the new array. New records can enter the visible prefix and older records can move out. This is different from a remote cursor client that appends immutable pages fetched at different times. Neither behavior is inherently wrong, but the product should decide whether the view is a live prefix or a stable browsing snapshot.

A live prefix can surprise a user reading a row if new data changes ordering. A stable snapshot can become stale and require a refresh action. A proposed remote explorer should name that choice and identify the query snapshot or revision if stability is promised. A timestamp-and-ID cursor alone does not automatically freeze the dataset.

Search and sort belong to query identity. Reusing a cursor from another filter or direction can produce incorrect continuation unless the server validates or encodes that scope. The current component resets pageCount and recomputes locally, avoiding that particular remote reuse pattern. A future adapter must preserve the intent explicitly rather than copying the UI state shape and assuming it remains safe over HTTP.

## Export scope differs from visible scope

The export query uses the same search and sort but a limit based on the full supplied response count. It therefore collects all locally supplied matches, not only the visible six or twelve rows. The CSV uses fixed fields name, email, role, and consent and a fixed filename. This is an intentional demo-oriented export shape, not an automatic export of every field in an arbitrary published schema.

An integrated UI should tell the user whether export means visible rows, all filtered rows, all authorized responses, or a selected snapshot. The current behavior most closely means all matches in the supplied local array. If that array later becomes only one server page, retaining the same code would silently export an incomplete dataset while the button still looks comprehensive.

A proposed server export endpoint can receive the filter and sort contract, apply authorization, bind a snapshot if needed, and return a file or job result. For large exports, a background job may be appropriate, but then the UI needs progress, expiry, and download authorization policies. Those are new capabilities, not consequences of switching a data URI to an HTTP URL.

## Display coercion can hide data distinctions

Name, email, and role cells convert values to strings and use a dash only for nullish values. An empty string remains visually empty rather than becoming the dash. Consent uses truthiness to choose Yes or No. Since AnswerValue allows strings and booleans, a malformed or loosely adapted consent value such as the string false is truthy and would display Yes. The expected schema may prevent that in a well-validated flow, but the component itself does not enforce boolean consent.

This is a useful adapter test case. A display component can either rely on a strict typed domain record whose runtime validation guarantees boolean consent, or handle unexpected values explicitly. Merely asserting TypeScript types at a network boundary does not validate actual JSON. A proposed response parser should preserve the distinction between missing, false, empty, and invalid types.

The timestamp cell formats in UTC and labels the result UTC. That is a clear timezone choice. It does not validate the timestamp before constructing a Date, so malformed input behavior should be handled upstream or characterized in a focused test. A production explorer should avoid silently presenting invalid or ambiguous times as if they were normal records.

## Data URI and export construction cost

The component constructs CSV and its encoded data URI during render. For small fixtures this is simple. For large data, filtering, sorting, CSV serialization, and URI encoding can consume memory and block rendering even when the user never clicks Export. A proposed lazy export can defer work until requested, while a server job can move large processing off the browser.

Measure the relevant cost before choosing an architecture. A benchmark of the query helper alone omits CSV and URI encoding. A browser interaction measure includes rendering and layout but may not isolate the cause. The experiment should state dataset size, field sizes, filter selectivity, and whether export construction is included. No performance claim follows merely from calling the current code inefficient; it needs a defined workload and observation.

The download link's fixed filename is also a provenance issue for multiple forms or filters. A proposed filename can include a safe form identifier and date, while a manifest inside or alongside the export records exact filter, publication scope, and generated time. Do not embed sensitive respondent details in filenames or rely on filenames as the sole provenance record.

## Exercises

**FF-30A, eight points:** Trace pageCount, visible rows, and recomputation after search, sort, and a new responses prop. Compare the current live local prefix with a proposed stable remote snapshot and define cursor query scope.

**FF-30B, six points:** Explain current CSV scope and fixed fields. Design an explicit export contract for all authorized filtered responses, including the case where the UI has loaded only one server page.

**FF-30C, six points:** Characterize missing, empty, boolean false, and string false in the table. Propose runtime parsing and an export performance experiment that includes serialization and encoding rather than only query time.

## Exit evidence

The explorer is correct only relative to a declared input and export contract. A user should know whether they are seeing a live prefix or a snapshot and whether the downloaded file covers the visible rows or a broader population. Those distinctions become essential when replacing local fixtures with paged network data.
