# Review 11. Presentation and recovery evidence

This guide covers chapters 29 through 32. It focuses on the meaning of user-visible messages and operational observations. A correct answer can identify a source-level possibility without claiming an unperformed integration test. Proposed fixes should retain the existing domain distinctions rather than hiding inconsistencies with more confident wording.

## FF-29A: completion populations

A defined completion timestamp contributes to completed even if its parsed duration is invalid or negative. The median uses only finite nonnegative durations. Therefore, completed count and median sample count can differ. A richer report can expose eligible duration count and excluded-duration count while preserving the original completion definition.

Award four points for the trace, two for the proposed report fields, and two for explaining why the populations must not be forced to match. The dashboard subtitle completed journeys only is directionally useful but does not name invalid-duration exclusions. A production label should reflect the actual analytical population.

## FF-29B: duration rounding

The current helper floors minutes and independently rounds the remainder. Near a boundary, the remainder can become sixty, so 119.6 seconds displays as one minute sixty seconds. A normalized proposal rounds total seconds first, then derives minutes and remainder. Null remains a separately defined absence state.

Award three points for boundary predictions, two for the normalized contract, and one for preserving analytical precision. Rounding each duration before computing a median can change the statistic differently from rounding the final median for presentation. A formatter correction should not silently redefine the underlying report.

## FF-29C: context and empty states

The dashboard hard-codes publication v1 and the role field. Its zero-start early return hides other sections even if responses are present. A fixture matrix should include mismatched telemetry/submission populations, invalid durations, rounded category percentages, unknown last-page identities, and ordinary empty data. Exact counts and rounded percentages should be described separately.

Award two points for source context, two for the fixture matrix, and two for honest population and rounding labels. A table caption cannot make a rounded percentage mathematically exact. A zero-journey dataset does not prove there are no authoritative submissions.

## FF-30A: local prefix behavior

Load more increases pageCount, and every render recomputes pages from the supplied array beginning with no cursor. Search and sort reset pageCount. A new responses prop changes the recomputed prefix, potentially moving rows. This is not retained remote pagination. A proposed stable remote snapshot needs a declared snapshot/query identity and cursor scope including filter and direction.

Award four points for the state trace, two for the live-prefix/snapshot distinction, and two for cursor scope. The existing fixed-fixture row-count test does not establish consistency while a remote dataset changes. A timestamp-and-ID cursor alone does not freeze that dataset.

## FF-30B: export population

The current export uses all matches in the locally supplied array, not only visible rows. It uses fixed field IDs and a fixed filename. If the prop becomes only one remote page, the same code would export only that supplied subset. A production contract should explicitly choose all authorized filtered responses, visible rows, or another named population and implement it at the appropriate authority.

Award three points for current behavior and three for the proposed contract. A server export may need snapshot binding, job progress, expiry, and download authorization. Those capabilities must be designed; an HTTP link by itself does not establish completeness or provenance.

## FF-30C: display and cost

Nullish name/email/role values use a dash, while empty strings remain empty. Consent truthiness displays both boolean true and a nonempty string such as false as Yes. A runtime parser should enforce the intended domain types or represent invalid values explicitly. The export performance experiment should include filtering, sorting, CSV construction, and URI encoding under a stated dataset and field-size workload.

Award three points for the value cases, one for runtime parsing, and two for meaningful performance scope. Type assertions at a network boundary are not validation. A benchmark of only the query helper cannot justify a claim about total browser export responsiveness.

## FF-31A: boundary ownership

ErrorBoundary owns only the failed flag and fallback/reset rendering. It does not persist or restore drafts. Resetting against a still-broken child can fail again. Remounting a child can reset its local state unless a separate owner retains the draft. An external draft store can support recovery, but the fallback needs evidence from that owner before promising preservation.

Award three points for actual ownership, three for the reset cases, and two for the storage-message assumption. The existing test establishes fallback and button presence, not successful reset or durable draft survival. A reassuring sentence is not an implementation of the guarantee it describes.

## FF-31B: connectivity and save levels

The model should distinguish browser online hint, API reachability, local persistence confirmation, and server confirmation. NetworkStatus listens to browser events and changes the banner; it does not probe the API or manage a durable replay queue. A browser can report online while the API is unavailable or authorization fails.

Award three points for the state distinctions, two for source/test scope, and one for truthful messaging. The autosave hook's debounce and promise queue are not automatically a browser-persistent offline outbox. A production offline claim needs explicit storage and conflict semantics.

## FF-31C: crash recovery

Before debounce, the newest draft may exist only in memory. During an in-flight save, a view reset must not assume the operation was cancelled or completed. Local-storage success with server failure preserves a local copy but not server acceptance. Server acceptance with lost response leaves a pending client record whose effect may already exist remotely. Each case needs the owner and evidence named.

Award three points for the four timelines, two for workspace/form/base-version ledger fields and storage-failure handling, and one for conflict-safe replay. Refreshing expectedVersion and blindly overwriting would discard another editor's work. An uncertain save outcome requires recovery evidence, not a fabricated rejected status.

## FF-32A: probe contract

The default readiness function returns true; it does not inspect durable dependencies. A proposed deployment should name required capabilities, a deadline, overlap control, cache staleness, and failure categories. A readiness timeout does not itself cancel underlying work. Not ready means the capability check failed to establish readiness, not that data has been lost.

Award three points for the current/default distinction, three for bounded probe design, and two for failure interpretation. Frequent probes should not perform destructive or expensive business operations. A global boolean can be useful if its capability scope is explicit.

## FF-32B: telemetry failure

The completion event includes bounded operational fields and avoids body/query payloads in the shown schema. The optional sink is called directly without a local catch or durable queue. A proposed adapter can isolate failures, bound buffering, and report dropped events, but must avoid recursive logging failures. A targeted framework-level test is needed to characterize a throwing onResponse sink's exact lifecycle effect.

Award two points for field and source accuracy, two for isolation design, and two for evidence limits. Do not assume a telemetry exception rolls back an already accepted draft or submission. Business state and observation state belong to different boundaries.

## FF-32C: identity and metrics

A client correlation ID is accepted under bounded syntax but need not be unique or authenticated. Server request identity, business operation identity, and durable event identity have different lifetimes. A retry can create another HTTP observation for the same submission operation. Metrics should distinguish conflict, validation failure, created submission, and duplicate replay when the instrumentation supports those outcomes.

Award three points for identity separation and three for useful populations and metrics. HTTP status-derived severity is a simple classification, not a complete incident-priority model. High conflict or duplicate rates need context before being labeled normal or broken.

## Evidence renewal exercise

Choose one UI sentence from these chapters and write the exact observation that would justify it. Then remove that observation from the scenario. The sentence should become narrower or explicitly uncertain. This exercise trains a habit that applies to dashboards, save indicators, readiness probes, and recovery screens: claims should follow evidence, and the product should remain useful when that evidence is incomplete.
