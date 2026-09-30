# 11. Analytics denominators and invalid time

A chart can display a precise percentage while answering the wrong question. FormForge's [analytics.ts](../../packages/core/src/analytics.ts) makes several population choices explicit: completion uses all supplied journeys, page drop-off uses that same started population, duration uses only valid nonnegative completed intervals, and choice share uses nonempty string answers. These are four related but different denominators.

Read [analytics.test.ts](../../packages/core/src/analytics.test.ts) alongside the implementation. The tests include an empty report, a four-journey example, choice shares, and generated completion flags. Your task is to explain what those observations establish and design cases that distinguish nearby but different metrics.

## Completion is based on marker presence

buildAnalyticsReport calls a journey completed when completedAt is not undefined. That is a classification rule about the presence of a field. Duration calculation then parses start and completion timestamps and retains only finite, nonnegative differences. A journey with a defined but invalid completion timestamp still contributes to completed count under the first rule, while contributing no duration to the median.

Work four journeys. A completes in sixty seconds. B completes in one hundred eighty seconds. C has no completedAt. D has completedAt set to an invalid date string. Started is four, completed is three, completion rate is three quarters, and the duration sample contains sixty and one hundred eighty. Its median is one hundred twenty seconds.

This result can surprise a learner who assumes the median and completion count describe exactly the same set. The function does not make that assumption. A future report can expose an invalid-duration count or reject malformed journeys at ingestion, but those are added contracts. Silently excluding D from completed as part of a chart refactor would change the current meaning of completionRate.

## Negative intervals are omitted from duration

A completion timestamp earlier than startedAt yields a negative duration and is omitted. A zero-second interval is retained. A nonfinite parse result is omitted. These choices avoid reporting nonsensical negative completion time, but they do not diagnose whether the cause was a client clock error, a corrupted record, or an event-order problem.

A useful incident report preserves those possibilities. If the median drops unexpectedly, first inspect sample composition and valid-duration count. Do not attribute the change to users completing faster without checking whether slow or invalid records disappeared from the duration population. Operational diagnosis needs a population ledger before a causal story.

The helper does not group journeys by user or deduplicate equal ids. Two records with the same id count twice if both are supplied. If upstream event ingestion can produce duplicates, the authoritative deduplication boundary needs to be established separately. Analytics cannot infer whether two identical-looking records are duplicate events or two legitimate attempts without a defined identity contract.

## Median differs from mean

The private median helper copies and numerically sorts durations. With an odd number it selects the middle value. With an even number it averages the two middle values. It returns null for no valid durations. It does not return zero to stand for missing data, because zero is a valid observed duration under the filter.

Use durations ten, twenty, and nine hundred. Median is twenty while mean is three hundred ten. This fixture makes the statistic observable. A test with three equal durations would pass whether the implementation used mean, median, minimum, or maximum, and therefore would not discriminate among those policies.

For even samples ten, twenty, thirty, nine hundred, median is twenty-five. A wrong implementation selecting only the lower middle would return twenty. A wrong lexicographic sort can also produce a different order for numerical values. Small boundary fixtures are more useful than a large random dataset without a known independent oracle.

## Drop-off is a share of starts

For each configured page, pageDropoff counts incomplete journeys whose lastPageId equals that page's id. Its rate divides by all supplied journeys, not by journeys that reached the page and not by all incomplete journeys. This measures the share of starts whose last observed incomplete page is that page.

Suppose ten journeys start, two complete, five stop at contact, two stop at role, and one has lastPageId unknown to the supplied pages. Contact rate is one half and role rate one fifth. The unknown-page journey remains in the denominator but appears in neither page row. The sum of visible page counts can therefore be less than all incomplete journeys. That does not require floating-point error or a missing array element in the renderer.

A per-page abandonment probability would need a denominator of journeys that actually reached that page. ResponseJourney stores only lastPageId, not full visited history, so this function cannot derive that alternative reliably. A feature proposal should request the needed event data rather than divide by a convenient but unrelated number.

## Choice share uses answered strings

choiceBreakdown keeps values that are strings and truthy. It does not trim them. Empty string is omitted; a whitespace-only string is included as a distinct value. Boolean false and true are omitted because they are not strings. Counts are grouped by exact string, then sorted by descending count and a lexical value tie-breaker.

This differs from required-response validation, whose empty helper trims strings and treats false as empty. It also differs from the schema's choice-label normalization, which trims and lowercases labels. A respondent's stored option id, a displayed option label, and an analytics grouping value are related through the application but are not interchangeable representations.

A proposed label-based chart should map stable option ids to the correct publication's labels. Using current draft labels for old responses could rewrite historical interpretation. That problem connects analytics back to snapshot identity: the same field or option display name can change while the accepted response belongs to an earlier schema.

## Independent practice

**FF-11A, eight points:** Calculate counts, rate, valid-duration sample, and median for a fixture containing valid, invalid, negative, and zero intervals. Explain why completed count can exceed duration sample count.

**FF-11B, six points:** Compare share-of-starts drop-off with abandonment-among-visitors. Use an unknown lastPageId and identify what extra data the second metric needs.

**FF-11C, six points:** Build a choice fixture containing empty, whitespace, differently cased strings, and booleans. Predict groups and denominator, then propose publication-aware label rendering without changing historical identity.

Review in [the analytics and change-evidence guide](review-05-analytics-and-diff-limits.md). Continue with [schema diffs and mentions](12-change-summaries-and-mention-boundaries.md).
