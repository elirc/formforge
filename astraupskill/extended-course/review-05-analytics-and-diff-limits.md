# Review 05. Analytics populations and change-summary scope

## FF-11A: count classification and duration validity separately

Hint: completedAt presence is tested before timestamp validity.

A defined invalid completion string counts as completed but contributes no finite duration. A negative interval also contributes no duration. Zero is retained. For valid durations sixty and one hundred eighty, median is one hundred twenty, regardless of additional completed records excluded from the duration sample. Empty valid-duration samples return null, while completion rate still follows its own population.

Award four points for correct populations and four for median reasoning and zero behavior. A good fixture includes an outlier so mean and median differ, and an even sample so choosing one middle value fails. Do not infer real user speed changes without checking which records entered the sample.

## FF-11B: a drop-off rate needs the right question

Hint: the denominator is journeys.length for every page row.

Current drop-off means incomplete journeys last observed on this page divided by all starts. Unknown lastPageId values remain in the overall denominator but contribute to no configured page row. Abandonment among visitors would need the number of journeys that reached each page, which cannot generally be recovered from lastPageId alone.

Award three points for current meaning and three for the alternative's data requirement. A proposed event history should define deduplication and completed/incomplete classification before charting. Dividing by incomplete count would produce a third metric, distribution of abandonment locations, rather than the requested visitor-based probability.

## FF-11C: choice grouping is exact string grouping

Hint: truthy string is not the same as trimmed nonempty string.

Empty strings and booleans are omitted. Whitespace-only strings remain, and differently cased strings are different groups. Rates divide by retained values, not all responses. A publication-aware label renderer should interpret stored option ids using the schema snapshot that governed the response, or explicitly describe how historical labels are migrated.

Award three points for groups and denominator, three for historical identity. Current draft labels can differ from published labels. A convenient lookup that silently relabels old responses may change the meaning of historical analytics even if its percentages remain numerically correct.

## FF-12A: summary output has a bounded vocabulary

Hint: follow the two array loops after the optional title comparison.

The helper emits optional form.renamed, then removals in before order, then updates/additions in after order. Reorder alone does not change matched field properties and has no movement category. Form description is not compared by the top-level title branch. Empty output therefore means no detected change in these categories, not full schema equality.

Award four points for output order and four for the two counterexamples. A publish screen can use this helper for a compact summary while relying on another explicit equality or change-detection contract. It should not make a stronger promise than its evidence.

## FF-12B: movement explanations are a design choice

Hint: A, B, C, D becoming B, C, D, A changes every index but can result from one action.

A position-difference policy reports all four index changes. A minimal-move explanation may report only A moved to the end. An action-log policy can report the actual recorded command but depends on retaining that history. Any of these can be coherent if the UI explains what the report means and tests ambiguous cases.

Award two points for the discriminating fixture, two for a stated policy, and two for its limitations. Do not claim a diff can always reconstruct the user's exact sequence of actions from two snapshots. Different action histories can produce the same final order.

## FF-12C: lexical evidence stops before delivery

Hint: returned strings do not establish accounts or side effects.

Test ordinary email exclusion, repeated normalized handles, punctuation boundaries, code or quoted contexts, and maximum-length behavior according to the chosen grammar. A future recipient pipeline must resolve membership and permissions separately. Stable notification identity might combine comment identity and recipient identity under a defined delivery attempt policy, but it needs persistence and failure handling beyond this helper.

Award three points for lexical tests and three for separating resolution/delivery. A mention parser should not send messages during a pure test. A fake delivery model can establish intended retry behavior without contacting anyone, and its evidence must remain distinct from a live notification integration.

These six exercises add one hundred twenty points to the growing assessment. Return to [the course index](README.md) with a metric dictionary and a list of claims each helper deliberately does not support.
