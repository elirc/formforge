# Review 15. Release evidence and final defense

This final guide reviews chapters 45 through 48 and provides an independent assessment of the complete course. It does not convert proposed features into implemented behavior. The strongest submissions make exact claims, identify the evidence behind them, and preserve uncertainty when a boundary has not been exercised.

## FF-45A: command graph

The root gate asks Turbo to run lint, typecheck, test, and build, then invokes sizecheck through a shell conjunction. If the Turbo command fails, sizecheck is not reached. Dependency builds are declared in the task graph, and tasks may be scheduled according to that graph rather than a simple narrative sequence. A report should name the actual command and observed task outcomes.

Workspace test scripts use passWithNoTests, so success alone does not prove tests were discovered. The reviewer should look for discovered tests or other output appropriate to the command. Award three points for gate/short-circuit behavior, three for the dependency graph and workspace distinctions, and two for test-discovery interpretation. A cached result can be legitimate evidence but should not be described as a fresh execution when it was restored.

## FF-45B: raw asset budget

The script reads immediate files in the web dist/assets directory, sums raw .js and .css byte sizes, and compares them with 450 KiB and 30 KiB limits. Equality passes because only larger values fail. Lazy JavaScript chunks count toward the total. The script does not measure compressed bytes, initial-route transfer, images, source maps, or execution latency. Missing output is a read failure, while stale output can misrepresent current source if sizecheck is run independently.

Award three points for exact measurement and limits, two for excluded costs and chunk behavior, and one for output provenance. A code-splitting change can improve initial loading without reducing the total raw sum. Conversely, a small bundle can still perform expensive synchronous work during user interaction.

## FF-45C: change-based verification

A renderer change calls for focused interaction and accessibility-state evidence plus relevant static/build checks. A durable adapter requires contract and independent-client concurrency tests, with API mapping coverage. CSV changes need parser-aware escaping and population checks. A documentation model needs its own bounded test command, link integrity, and exercise/review coverage. The report distinguishes executed, cached, blocked, and not required.

Award three points for meaningful mapping and three for honest scope. Do not install or mutate dependencies solely to decorate a documentation report with broad checks. When a runtime change actually requires setup, record the setup and exact blocked or executed command. Repeating unchanged suites without a new risk does not strengthen a specific boundary claim.

## FF-46A: workload design

The performance question should name a user-visible interaction. Search/export workloads vary response count, answer length, selectivity, timestamp ties, and requested pages. Builder workloads vary fields, options, rules, and rule depth under valid assumptions. Analytics workloads vary journeys and pages. Synthetic data should preserve relevant identities and types rather than using arbitrary random bytes or only tiny demo fixtures.

Award three points for the question and target, three for workload dimensions, and two for reproducibility and domain validity. A benchmark whose data violates the normal contract may still be useful for rejection cost, but it must be labeled as that workload rather than normal editing performance.

## FF-46B: phase evidence

Separate query work from CSV/URI generation and rendering, analytics aggregation from dashboard rendering, or reducer work from validation/preview/focus scheduling. Record environment, repetitions, variability, warm-up assumptions, and input preservation. A browser trace includes more of the user experience, while a microbenchmark isolates a helper. Neither automatically substitutes for the other.

Award three points for phase boundaries and three for measurement discipline. A timeout-based focus observation is not direct evidence of reducer CPU cost. A benchmark that mutates its input between iterations may accidentally measure easier later work. The report must establish that each trial performs the intended operation.

## FF-46C: optimization and correctness

One coherent optimization is computing a filtered/sorted view once and deferring CSV generation until export. Another is single-pass analytics aggregation that preserves completed predicates, invalid-duration exclusion, unknown-page behavior, and page order. Memoization needs keys covering all relevant inputs and immutable update discipline. The before/after report uses the same declared workloads and includes correctness evidence.

Award two points for the optimization contract, two for invalidation or algorithmic invariants, and two for a bounded performance claim. A faster stale cache or incomplete export is a behavior regression. Tight timing assertions should be used only when the environment supports them; otherwise report measured distributions or appropriate budgets separately from deterministic correctness tests.

## FF-47A: contract ownership

Core owns pure interpretation and transformation, data owns repository effects, API owns untrusted request adaptation and protocol mapping, and web owns interaction/presentation with current demo boundaries. A proposed feature should place each invariant where it can be enforced. Authorization cannot be established by hiding a button, and a core parser cannot identify an authenticated actor.

Useful distinctions include base/local/remote schemas and current-page/full-session answers. Accidental duplication can occur when callback predictions diverge from committed reducer state or UI labels imply reconciled analytics populations without a data contract. Award four points for the responsibility map, two for intentional distinctions, and two for a concrete duplicate-authority problem and remedy.

## FF-47B: decision record

The record should begin with a concrete trigger, such as republishing during a respondent session, then state the chosen policy and consequences. Publication-bound versus latest-only response, live versus snapshot export, and manual versus automatic reconciliation are legitimate decisions. Include storage authority, client recovery, evidence, and limitations. Technologies come after the behavior they must support.

Award two points for the trigger and choice, two for consequences, and two for a minimal meaningful evidence package. A learning chapter can present alternatives; an operational record must identify the deployed choice. Do not preserve abandoned ideas as if they were part of the final protocol.

## FF-47C: maintaining claims

The claim register links consequential behavior to source anchors, categories, change triggers, and verification limits. Links resolving does not prove semantics stayed the same. Unique exercise IDs and separate review coverage support navigation, while learner answers remain untouched. Historical examples should be labeled when current behavior changes rather than left as present-tense defects.

Award two points for the register, two for semantic and structural checks, and two for preservation and a regression counterexample. A good counterexample remains small and source-specific, such as same-room session replacement, P1/P2 retry scope, or hidden-error lifetime. It should explain an invariant rather than mirror implementation line by line.

## FF-48A: identity and acceptance ledger

The ledger distinguishes resource identities from interpretation, operation, observation, and job identities. Workspace/form scope differs from publication identity; slug can remain stable while publication changes; request correlation can change while a logical attempt persists; local session completion differs from submission acceptance. Proposed identities such as durable journey or export-job IDs must be marked absent from current behavior where appropriate.

The acceptance timeline names local memory, browser persistence, server draft commitment, publication creation, submission commitment, event intent, analytical projection, and artifact finalization as separate boundaries. Current demo callbacks and fixed receipts are annotated rather than promoted into network effects. Award four points for identity and four for acceptance/observation accuracy.

## FF-48B: preserving work and meaning

The offline respondent needs an explicit old-publication or migration policy with original answers retained. A lost response requires immutable attempt identity and retained evidence; matching answer text alone does not justify deleting duplicate-looking submissions. Hidden consent needs a declared rendering/validation/serialization policy. Analytics must separate journey population, completion authority, duration eligibility, and formatting. Export analysis checks loaded data scope, query snapshot, columns, and historical mappings.

Award three points for respondent preservation and three for analytical/export diagnosis. The answer should resist forcing one root cause across unrelated symptoms. A formatter boundary, publication-scope race, and incomplete local export can coexist without one explaining the others.

## FF-48C: launch claims

The verification matrix should map each proposed integration to its relevant model, component, API, durable storage, browser, and operational evidence. It should retain the limits of the raw bundle check, accessibility fixture, and pure models. The implementation/proposal inventory should identify demo saves, fixed receipts, local completion, and fixture analytics before claiming a production launch is ready.

Award three points for the matrix and three for the inventory and strongest justified claim. The correct current claim can be narrower than the desired launch goal. A concrete continuation plan is better than declaring readiness based on build success while the actual business paths remain demonstrations.

## Integrated scoring conference

Review the five final artifacts together rather than scoring them as unrelated documents. A response policy that binds to P1 must carry P1 into the analytics provenance and export mapping. An export promised as a snapshot must use a count and row population from that snapshot. A recovery message claiming local preservation must point to a successful local write or another retained owner. Inconsistency across artifacts is a contract defect even when each page sounds plausible on its own.

Ask the learner to identify the weakest evidence in their proposed release plan. A mature answer names a concrete missing boundary, such as independent-client transaction behavior or browser storage failure, and gives the smallest next experiment. An answer that says everything is covered because all tests passed should be challenged to list what those tests actually imported and observed.

Then change a timing assumption. Let publication happen before the first submit rather than before retry, or let a draft save commit after the view switches forms. The learner should update the result by following identity and authority, not by inventing a special case. This reveals whether the course's concepts have become a working reasoning method rather than memorized terminology.

## Portfolio evidence standard

A finished portfolio should include at least one exact source trace, one adverse asynchronous schedule, one pure-model result, one proposed durable contract, one user-facing recovery design, and one bounded verification report. The artifacts should use synthetic data and preserve original starter and learner files. They should clearly mark current behavior, observed result, source-level possibility, and future proposal.

The portfolio does not need to implement every extension in the workbook. Its value lies in demonstrating that the learner can choose a bounded problem, preserve adjacent invariants, and produce evidence another engineer can review. A small completed adapter with honest limitations is stronger than a broad architecture sketch that assumes away concurrency, identity, or recovery.

For future maintenance, attach a source revision or review date to consequential claims and revisit them when the relevant boundary changes. Keep the course's executable models separate from application integration checks. Their green results remain useful facts about those models, while new runtime features must earn their own evidence. This final distinction keeps both the learning pack and the application trustworthy as they evolve.

## Worked review disagreement

Suppose two reviewers disagree about whether a retry test is sufficient. One points to the six passing submission-scope model checks. The other asks for a durable concurrency test. Both can be correct about different claims. The model establishes first-wins scope and early-validation behavior within its transition function. It does not establish that two independent database clients cannot both insert the first submission. Resolve the disagreement by writing the disputed sentence: either the model preserves one entry per modeled scope, or the deployed adapter enforces one durable submission under concurrent requests. The first has evidence; the second needs another experiment.

Now suppose the proposed durable test sends requests sequentially and observes one created result and one duplicate. That verifies ordinary replay but still does not exercise simultaneous creation. Improve the schedule by coordinating two independent clients so both attempt the same previously absent scope, then inspect the authoritative records and both results. Preserve a positive control with distinct keys so the test does not pass merely because the adapter rejects every request. Record the storage engine and transaction configuration because those are part of the concurrency evidence.

Finally, ask what happens after a committed response is lost. A concurrency test can pass while recovery still generates a new key and creates another logical response. Add that client schedule separately rather than broadening the original test's name to imply it covers recovery. This worked disagreement illustrates the review method: identify the exact claim, select the boundary that can establish it, and add evidence only where a real gap remains. The result is a smaller, clearer verification package than a large suite whose labels promise more than its assertions observe.
