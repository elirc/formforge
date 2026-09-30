# 10. Response cursors and CSV boundaries

The response browser and exporter transform accepted answers into other representations. Those transformations carry their own ordering, identity, and safety contracts. [responses.ts](../../packages/core/src/responses.ts) supplies a pure query function and a CSV encoder, making it a useful place to practice precise claims without starting a server.

## Filtering happens before total and paging

queryResponses trims the search term and lowercases it using locale-aware string conversion. When the term is nonempty, it retains responses where at least one answer value's string form contains the term. An undefined value is represented as an empty string for this search. Boolean values become their string representations.

The filtered collection is sorted by submittedAt and then id. Oldest uses ascending comparison; newest reverses both components through the sign multiplier. A tied timestamp therefore does not leave order unspecified as long as ids differ and the comparison behaves consistently in the environment. The id is a tie-breaker within this function, not proof that duplicate response ids are impossible in arbitrary input.

Total is the filtered collection length before cursor slicing. It is not the size of the returned batch and does not count only rows after the cursor. A page of two from five matches still reports total five. This is the same scope discipline used earlier for publication histories: a number is meaningful only when its population is named.

## The cursor locates an existing row

cursorFor encodes a JSON pair containing submittedAt and id with encodeURIComponent. The query function does not decode a general sort tuple and issue a keyset comparison. Instead, it searches the current sorted array for a response whose generated cursor exactly equals the supplied string. Start is one position after that match.

If no matching row exists, findIndex returns minus one and start becomes zero. A malformed, stale, or filter-mismatched cursor therefore restarts from the beginning under the current implementation. This is an important distinction from a strict cursor API that rejects invalid tokens or resumes by a tuple even when the anchor row has been deleted.

The token does not bind the search term, sort direction, schema, or user context. Reusing it under a different query can locate the same row at a different position or fail to locate it and restart. A future HTTP paging contract should define whether such reuse is permitted, rejected, or reset with explicit feedback. Encoding data for a URL is not integrity protection or query binding.

## Limits have a narrow normalization

The function slices using Math.max(1, query.limit). This ensures an ordinary finite zero or negative input asks for at least one position. It does not constitute a complete runtime parser for NaN, infinity, fractional values, or arbitrary untrusted JSON. TypeScript's number type does not rule out those numerical values.

For the intended ordinary positive-integer calls, hasMore compares start plus returned length with sorted length. A nextCursor is provided only when there is more and there is a last returned item. The returned cursor belongs to that last item. A test should assert both the exact ordered ids and nextCursor presence; checking only total misses broken pagination.

The function creates a filtered array or copies the original array before sorting, so it does not reorder the caller's original array through sort. It still returns references to the original response objects. If a caller mutates a returned response's nested answers, the function has not established deep ownership isolation. Read-only TypeScript interfaces do not freeze runtime objects.

## Work a changed-query trace

Take responses A and B at the same timestamp, then C later. Oldest sorts A, B, C; newest sorts C, B, A. A page size one in oldest mode returns A and a cursor for A. Reusing that cursor in newest mode finds A at the end and returns an empty page, rather than continuing the old ascending traversal. The result follows the function but may surprise a client that kept stale cursor state after changing sort.

A client adapter should reset its cursor when the query identity changes or use a stronger token contract. This is a proposed integration rule, not an automatic property of the pure function. Test the state transition that changes sort and search, not only queryResponses with a fixed configuration.

## CSV has syntax and consumer interpretation

escapeCsvCell converts undefined to empty text and otherwise uses String. If the resulting text begins with equals, plus, minus, or at-sign, it prefixes an apostrophe. It then applies CSV quoting when the text contains comma, quote, carriage return, or newline, doubling embedded quote characters.

These are two distinct transformations. CSV quoting preserves cell boundaries and literal quote content. The leading apostrophe attempts to prevent common spreadsheet formula interpretation for the inspected leading characters. Quoting alone would not necessarily neutralize formula-like cell content in a spreadsheet consumer. Conversely, adding an apostrophe does not replace the need to escape commas and embedded quotes.

The guard is anchored at the first character. It does not trim input before testing and does not establish complete safety for every spreadsheet product, import setting, or alternative leading control character. A course should state the exact transformation and use controlled consumer tests for broader claims. It should not advertise universal safe spreadsheet export from one regular expression.

exportResponsesCsv writes a header containing response_id, submitted_at, and requested fieldIds. It maps the same escape function over header and row cells, joins cells by comma, and joins rows by CRLF. Field order is the supplied fieldIds order, not object property enumeration order. A missing answer yields an empty cell in the right column.

## Independent practice

**FF-10A, eight points:** Trace filtering, tied timestamps, oldest/newest order, page size, total, and nextCursor for a small fixture. Reuse an ascending cursor in descending order and explain the exact result.

**FF-10B, six points:** Compare absent cursor, unknown cursor, deleted anchor, and changed search. Propose a stricter contract or an explicit reset policy without claiming the current function implements it.

**FF-10C, six points:** Predict CSV cells for a comma, embedded quote, multiline answer, undefined, false, and leading equals. Separate syntax escaping from formula mitigation and identify a limitation needing a real consumer test.

Consult [the separate review](review-04-flow-and-response-evidence.md) after writing your fixtures. Return to [the course index](README.md) for later integration and storage modules.
