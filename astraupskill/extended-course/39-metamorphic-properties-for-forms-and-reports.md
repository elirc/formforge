# 39. Metamorphic properties for forms and reports

Example tests show what should happen for selected inputs. Metamorphic tests ask how an output should change when the input changes in a controlled way. This chapter develops source-specific properties for [builder.ts](../../packages/core/src/builder.ts), [responses.ts](../../packages/core/src/responses.ts), and [analytics.ts](../../packages/core/src/analytics.ts). It does not add broad random test infrastructure or run unchanged application suites. Answers are in the [model and adapter review](review-13-models-and-adapter-evidence.md).

## Properties need assumptions

Consider the statement that sorting responses does not change the total. It is true for the same response array and search filter under the helper's current behavior. It is not a statement that newest and oldest pages contain the same items when the page size is smaller than the result set. Name the input relationship and output relationship separately.

Similarly, adding one completed journey increases starts and completions by one, but it does not necessarily increase completion rate by a fixed amount or increase the median duration. The median depends on the existing sample distribution, and invalid timestamps can exclude the new duration while still increasing completed count. A good property reflects those exact rules rather than a vague expectation that more success makes every metric larger.

Write assumptions beside each property. Are IDs unique? Are timestamps valid and normalized? Is the schema valid? Is the operation a no-op? Without those conditions, a failing generated case can indicate an invalid premise rather than an implementation defect. The purpose is to find meaningful counterexamples, not to produce random failures that nobody can interpret.

## Builder properties

For a valid schema with unique IDs, moving a field should preserve the multiset of field identities and field contents while changing order according to the clamped target. Moving to the same effective position can preserve the original state reference. Removing a field should eliminate that ID and preserve the relative order of remaining fields. Duplicating should add one new logical identity when the supplied new ID is actually unique.

The uniqueness condition is essential because the reducer does not enforce every allocation invariant. A property that supplies a colliding new ID and then expects global uniqueness is testing a contract the reducer does not currently promise. That can motivate a proposed guard, but the test should be labeled accordingly.

Inverse operations also need care. Moving a field away and back can restore field order, but UI selection or reference identity may differ according to the reducer's behavior. Removing then re-adding a field is not necessarily an inverse because insertion position and selection change. Do not assert whole-state equality when the intended invariant concerns only schema contents.

## Response query properties

For a fixed valid dataset and no cursor, newest and oldest order should be reversals under the same total comparator when all records fit in one page. Filtering with an empty or whitespace-only search should match the helper's no-search population. Input array order should not affect the sorted result when IDs and timestamps establish a total order.

Paging properties must respect the exact-anchor behavior. On a fixed dataset, repeatedly following returned cursors should concatenate the ordered filtered population without duplicates, assuming unique IDs and stable records. If the dataset changes or an anchor is deleted, that property no longer follows from the current helper. A test should not conceal this assumption by rebuilding a different fixture between pages.

An export property can assert that every chosen response contributes one logical CSV row after proper parsing, not by counting newline characters in the raw string. Fields can contain embedded newlines inside quoted cells. This is a useful example of choosing an observation at the right representation layer: raw line count is not CSV record count.

## Analytics properties

Permuting journey order should not change aggregate counts or median, because the report derives those from values and sorts durations. Duplicating every journey doubles starts and completions while preserving completion rate, and duplicates each eligible duration so the median should remain the same under the ordinary mathematical definition. This property deliberately describes duplicated input, not a claim that duplicate ingestion is desirable.

For choiceBreakdown, permuting responses should preserve counts and sorted results under the comparator. Duplicating all eligible responses doubles counts while retaining rates. Adding an empty string or boolean answer for the chosen field does not add an eligible string category under current behavior. Adding a whitespace-only string does add a category because the helper checks truthiness rather than trimming.

That last contrast is valuable: a property based on all visually blank answers being ignored would fail against the source. The failure reveals a mismatch between product expectation and implementation, not necessarily an arithmetic error. Decide whether to characterize the current rule or propose normalization, and keep the two test suites distinct.

## Generate small counterexamples

Start with tiny deterministic domains before adding random generators. Two fields are enough to test move boundaries; three records with equal timestamps expose tie-breakers; two completion durations test even medians; an empty string and a space expose answer normalization. Small cases are easier to explain and minimize when a property fails.

If you later use generated inputs, preserve seeds and shrink failing examples toward the smallest meaningful case. A failure report should include the violated property, assumptions, transformed input relationship, and observed output difference. Do not dump real respondent data into a test artifact. Synthetic values can exercise the same structural boundary.

Property tests are especially useful for pure helpers because they have deterministic inputs and outputs. They do not replace integration evidence for browser FormData, database concurrency, or API validation order. A broad property over an isolated model can remain green while an adapter passes the wrong publication or workspace identity.

## Exercises

**FF-39A, eight points:** Define three builder metamorphic properties with explicit uniqueness and no-op assumptions. Give one tempting inverse-property claim that is too strong and explain the smaller invariant that remains valid.

**FF-39B, six points:** Specify fixed-dataset query and CSV properties, including equal timestamps and embedded newlines. Explain why deleted-anchor paging and raw newline counts require different expectations.

**FF-39C, six points:** Define permutation and duplication properties for analytics, then contrast empty and whitespace-only choice answers. Design minimal counterexamples and state whether each check characterizes current behavior or proposes a new normalization rule.

## Exit evidence

A useful property is a compact explanation of a relationship the code must preserve under stated assumptions. It is not a slogan such as sorting works or analytics is correct. The learner should be able to explain why each transformation should preserve or change the result and what a failing minimal example would teach.
