# 29. Analytics presentation and rounding contracts

An analytics function can compute a correct number while the interface presents an incomplete or misleading interpretation. This chapter studies the layer between [analytics.ts](../../packages/core/src/analytics.ts) and [AnalyticsDashboard.tsx](../../apps/web/src/AnalyticsDashboard.tsx). The [dashboard tests](../../apps/web/src/AnalyticsDashboard.test.tsx) provide bounded examples, not a proof for every input. Work the exercises before the [presentation review](review-11-presentation-and-recovery-evidence.md).

## Preserve the population through the view

The core report counts all supplied journeys as starts and journeys with a defined completion timestamp as completed. It computes valid nonnegative durations separately, excluding invalid or reversed timestamps from the median. The dashboard labels the completion metric with completed out of started, which helps expose the denominator. Its median subtitle says completed journeys only, but that phrase does not reveal that some completed records may have invalid durations and be excluded from the median.

A proposed production display can show the number of eligible duration samples or an invalid-duration count when that distinction matters. Do not change the completion count simply to make it match the duration sample size; those metrics answer different questions. Instead, carry both populations through the report model so the interface can describe them accurately.

The role breakdown comes from responses, while completion and drop-off come from journeys. These arrays can have different counts or inconsistent coverage. The component accepts them independently and does not join or reconcile them. A dashboard showing both sections should not imply that every response has exactly one matching journey unless the upstream data pipeline establishes that relationship.

## Duration formatting has a boundary case

The duration helper floors seconds divided by sixty to get minutes, then rounds seconds modulo sixty for the remainder. For a value just below a minute boundary, the remainder can round to sixty. A value of 119.6 seconds becomes one minute and sixty seconds under this arithmetic rather than a normalized two minutes. A value below one minute can display sixty seconds rather than one minute.

This is a small but concrete presentation issue that a boundary-focused exercise can expose without changing application code. A proposed formatter can round total seconds first, then derive minutes and remainder from that integer. The design should also state whether it rounds, floors, or preserves decimals and how it handles null. The current null branch says Not enough data; it does not distinguish zero eligible samples from another reason for absence.

Do not solve the problem by rounding source durations earlier in the analytics calculation without considering the median. Rounding each sample before computing a median can differ from rounding the final median for display. Preserve analytical precision until the presentation boundary unless the report's statistical definition explicitly uses rounded samples.

## Percentages and exact tables

The percent helper uses an en-US formatter with at most one fractional digit. The visual bar width uses the unformatted rate multiplied by one hundred, while the table displays the formatted percentage and an exact count. The table captions call the values exact, but the displayed rates are rounded for readability. The counts provide a route to reconstructing the underlying fraction when the denominator is known.

A proposed wording can distinguish exact counts from rounded percentages. This matters when several categories sum to 99.9 or 100.1 after independent rounding. That result can be mathematically consistent with exact rates summing to one. Do not force the displayed percentages to sum to one hundred by silently altering a category unless the product defines a documented rounding-allocation method.

For drop-off, categories need not sum to all starts because completed journeys and unknown last-page identities can fall outside the displayed incomplete-page counts. The interface already labels shares of all starts, which is useful. A reviewer should still ask whether missing or unmatched page identities need an explicit row or data-quality warning rather than interpreting the visible bars as an exhaustive partition.

## Hard-coded context is a demo boundary

The dashboard's introductory text says Published form / v1, and its choice section reads the role field. These are fixed presentation choices in the current component. Passing data from another form or publication does not automatically update those labels or select a different choice field. A production reusable dashboard would need explicit form/publication context and field configuration.

This is a good example of why a generic-looking component signature does not establish generic domain behavior. The props accept journeys, responses, and pages, but the rendering still embeds a particular report. A source-grounded course should identify that boundary rather than claim the component is already a universal analytics engine.

A proposed report configuration can carry publication identity, selected field ID, historical label, and denominator description. Keep those values tied to the data query so a stale heading cannot describe a newly fetched dataset. If the UI allows changing publication filters, use a query identity that includes those filters and render loading or stale states deliberately.

## Empty data is not one universal state

The component returns its empty view when report.started is zero. That hides the rest of the dashboard even if responses is nonempty. This may be reasonable for the current demo's expected data alignment, but it is a meaningful behavior to characterize for an integrated pipeline where journey collection can fail independently of response storage.

A future UI can distinguish no form starts, responses without journey telemetry, loading, query failure, and filtered-out data. Those states should not all say No journeys yet if they imply different recovery actions. In particular, a telemetry outage should not make the product claim no respondents exist when authoritative submissions are present.

The opposite mismatch also matters: journeys can exist without stored responses, perhaps because users abandoned the form or because the response query is scoped differently. The interface should identify each population and avoid implying a reconciliation it has not performed. A reporting contract can include data freshness and coverage metadata alongside counts.

## A presentation laboratory

Use synthetic inputs for zero starts with nonzero responses, one completed journey with an invalid timestamp, durations near minute boundaries, three equal choice categories, and an incomplete journey whose last page is unknown. Predict the core result and displayed text separately. A table with those two columns prevents the view's wording from being mistaken for the report's mathematical definition.

A future focused test can render each fixture and inspect labels, counts, and formatted values. A pure formatter test can cover minute normalization, but it does not establish chart accessibility or layout. The existing dashboard test checks representative denominator text and table presence; it does not cover all these boundary cases. The course does not rerun unchanged application tests to claim those missing observations.

## Exercises

**FF-29A, eight points:** Trace completion count and median sample eligibility for a completed journey with invalid time. Define a report model that lets the UI name both populations without changing their meanings.

**FF-29B, six points:** Predict duration formatting near sixty and one hundred twenty seconds, and explain the difference between rounding samples before aggregation and rounding the final result. Propose a normalized display contract.

**FF-29C, six points:** Analyze the hard-coded publication/role context and zero-start early return. Design a presentation fixture matrix that distinguishes empty, incomplete telemetry, and cross-version data without overstating exact percentages.

## Exit evidence

A reliable dashboard carries provenance and denominators all the way to the screen. Its labels are part of the contract, not decoration. The learner should be able to explain which records contributed to every displayed number and which rounding or filtering happened between the analytical result and the text a user reads.
