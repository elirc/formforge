# 46. Performance experiments with representative workloads

FormForge's pure helpers and React surfaces offer several measurable costs: schema validation, rule evaluation, response filtering/sorting, analytics aggregation, CSV construction, and rendering. This chapter designs experiments grounded in [responses.ts](../../packages/core/src/responses.ts), [analytics.ts](../../packages/core/src/analytics.ts), [FormBuilder.tsx](../../apps/web/src/FormBuilder.tsx), and [ResponseExplorer.tsx](../../apps/web/src/ResponseExplorer.tsx). It does not claim benchmarks were run. Answers are in the [final review](review-15-release-evidence-and-final-defense.md).

## Begin with a user question

Choose a concrete question such as whether typing in the response search remains responsive with a large local dataset, whether moving a field delays focus restoration, or whether export generation blocks the interface. These questions imply different observations. A helper microbenchmark can isolate computation, while a browser interaction trace includes scheduling, rendering, and layout.

Do not start by optimizing whichever function looks longest. The explorer recomputes pages and CSV during render, while the builder validates schema during render and renders a live preview. Either can matter under a particular workload, but source inspection alone does not establish which dominates a user's delay. The experiment should separate likely costs before choosing an optimization.

State a target in terms meaningful to the product, such as bounded interaction latency under a declared dataset. Avoid an unexplained faster percentage measured on a tiny fixture. A tenfold improvement from an already negligible operation may not affect the user, while a smaller improvement in a repeated render path can be valuable.

## Construct representative synthetic data

Vary response count, answer length, filter selectivity, timestamp ties, and number of requested pages. A search that matches nothing can have different rendering cost from one that matches every row. Long free-text answers increase scanning and CSV work. Equal timestamps exercise tie-breaker comparisons. A dataset with only short names and unique times may underrepresent real work.

For builders, vary field count, choice-option count, rule count, and nested rule depth within valid schema constraints. Include duplicate-label or invalid-schema cases only when testing validation failure cost, not as accidental inputs to a normal editing benchmark. Record the generator's deterministic seed or explicit construction so another engineer can reproduce the workload without real respondent data.

Synthetic data should preserve the structural relationships that matter: unique field IDs where required, valid publication references, and realistic answer types. Random bytes are not automatically representative. They can stress parsers but miss ordinary UI behavior, while overly tidy demo data can hide expensive worst cases. Use several named workload profiles and explain what each represents.

## Separate phases

For response search, measure filtering and sorting separately from rendering and CSV construction if possible. The component's export calculation occurs even before a click, so a typing delay might include work the user did not request yet. A proposed lazy export can reduce that work, but then the click latency becomes a separate measure. The optimization moves cost; it does not necessarily eliminate it.

For analytics, report aggregation time and dashboard rendering independently. The core computes per-page drop-off by filtering journeys for each page, so page count and journey count both matter. A proposed single-pass aggregation can reduce repeated scans, but tests must preserve unknown-page handling, completed predicates, duration eligibility, and output page order.

For schema editing, measure reducer transformation, validation, preview rendering, and deferred focus separately where practical. A faster reducer does not fix a slow preview, and a delayed timeout focus does not prove the reducer itself was slow. Instrumentation should identify phases without changing the semantics being measured.

## Repeat measurements responsibly

Run enough repetitions to observe variability and distinguish setup from steady-state work. Record runtime version, machine context, dataset, and whether other heavy processes were active. Warm-up, garbage collection, and caching can affect results. Do not discard inconvenient samples without a declared reason; report a distribution or representative summary appropriate to the experiment.

For browser interactions, use a controlled route and consistent viewport, but do not claim universal performance across devices. A local desktop result is evidence for that environment. If the product targets lower-powered devices, include a suitable constrained environment or explicitly leave that validation outstanding.

Avoid benchmarks that mutate and reuse the same input in ways that make later iterations easier. The query helper copies before sorting, but a custom benchmark adapter might cache or alter data. Verify input preservation and reset state between trials where needed. A measurement is only meaningful if each trial performs the intended work.

## Optimize one boundary at a time

Suppose the experiment shows repeated sorting and CSV generation dominate search interaction. A first proposal can compute a filtered/sorted result once per query and defer CSV until export. Verify identical visible ordering, total, cursor behavior, and export population. Then measure again under the same workload. Do not simultaneously change search semantics, paging, and CSV columns, because the performance comparison would mix behavioral changes with optimization.

For analytics, a single-pass map can preserve counts while reducing repeated scans. Its tests should include invalid timestamps, unknown pages, duplicate journeys, and empty inputs so the optimization does not silently redefine the report. For rule evaluation, memoization requires keys that include relevant answers and rule identity; an incomplete key can produce fast but stale visibility.

Every cache needs an invalidation contract. A cached CSV must update when responses, filter, sort, or selected columns change. A cached schema issue list must update when the schema changes, including nested options. Reference-based memoization works only when callers preserve immutable update discipline; in-place mutation can hide changes from the cache.

## Report results without overclaiming

A useful report states the user question, workload profiles, baseline and changed implementation, measurements, correctness checks, and limitations. It can say that one interaction improved under a declared dataset. It should not say the entire application is fast because one helper benchmark improved or the bundle budget passed.

Include a regression threshold only when the measurement is stable enough to support it. Tight wall-clock assertions in ordinary unit tests can become flaky across machines. A dedicated benchmark report or broad budget may be more appropriate. Correctness tests should remain deterministic, while performance evidence can use a controlled environment and documented variability.

## Exercises

**FF-46A, eight points:** Choose one user-visible performance question and define three representative synthetic workloads. Identify the input dimensions that stress the actual source path rather than relying only on record count.

**FF-46B, six points:** Design phase measurements for search/export, analytics, or builder editing. Include repetition, environment, input preservation, and a distinction between microbenchmark and browser evidence.

**FF-46C, six points:** Propose one optimization and its cache/invalidation or algorithmic contract. Specify correctness cases and a before/after report that avoids claiming universal speed from a narrow measurement.

## Exit evidence

Performance work is successful when it improves a defined experience while preserving meaning. The experiment should make both claims reviewable. A faster wrong filter, stale visibility cache, or incomplete export is not an optimization; it is a behavior change hidden behind a timing result.
