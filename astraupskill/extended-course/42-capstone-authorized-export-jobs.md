# 42. Capstone: authorized export jobs

The current response explorer builds a CSV from its supplied local array. A large production export needs a separate contract for authorization, query scope, snapshot consistency, job lifetime, and download access. This capstone starts from [ResponseExplorer.tsx](../../apps/web/src/ResponseExplorer.tsx) and [responses.ts](../../packages/core/src/responses.ts). It proposes a job workflow without implementing or deploying one. Review guidance is in [the operational capstone guide](review-14-operational-capstones.md).

## The requested behavior

An authorized analyst wants all responses matching a filter across selected publication versions. The browser has loaded only the first page. The export may take long enough that the analyst changes the filter, closes the tab, or loses workspace access before completion. The downloaded artifact must still have an unambiguous scope and must not be delivered to an unauthorized caller.

Define the export request as an immutable query specification. Include workspace, form/publication scope, filter, sort, column mapping, and snapshot policy. Do not let a worker later read whatever filter happens to be current in the UI. The job identity should refer to the accepted specification, just as a submission operation identity refers to an immutable payload.

The current helper's fixed name/email/role/consent columns are not sufficient for arbitrary historical forms. The capstone must define a schema-aware column or normalized-row strategy and preserve publication provenance. If multiple versions reinterpret a field, include the mapping decision or separate columns rather than silently combining incompatible values.

## Authorization at creation and download

The service checks that the actor may request the export for the specified workspace and data class. A background worker then operates under a bounded job scope, not an unrestricted global context. At download time, the service should re-evaluate access according to the chosen policy. A user who lost permission after creating the job may no longer be allowed to retrieve the file.

Choose whether revocation cancels pending jobs, blocks download only, or also removes already generated artifacts. Already downloaded copies cannot be recalled by deleting the server artifact. State that limitation plainly. A download token can be short-lived and scoped to one artifact, but possession of a token should not accidentally bypass the product's intended revocation policy.

Avoid placing sensitive query details or respondent data in predictable filenames, public URLs, or ordinary logs. An opaque job ID and a safe filename can coexist with a detailed authorized manifest inside the artifact. The worker needs enough identity for audit and recovery without exposing every answer in telemetry.

## Snapshot and count semantics

If the export promises a snapshot as of job creation, the worker must read from a mechanism that preserves that population or materialize the selected identities under a defined consistency boundary. Simply starting a long sequence of live pages later can include some new responses and miss others. If the product instead exports the live dataset as encountered, label that weaker contract and explain how duplicates or changes are handled.

The manifest should record the accepted query, snapshot identity or observation interval, row count, publication mappings, generated time, and format version. Row count should mean logical response records or normalized answer rows according to the chosen format. Do not count physical newline characters when cells can contain embedded newlines.

A separate count query can disagree with the exported rows under concurrent writes unless coordinated. The job can derive count from the actual emitted records and compare it with a planned count only as a diagnostic. A successful job should not claim an exact precomputed total when its query semantics allow the population to change during execution.

## Streaming and partial artifacts

Large exports should avoid holding every response and encoded CSV string in browser memory. A proposed worker can stream rows to an owned temporary artifact, then publish the final artifact only after successful completion and validation. A partially written file must not appear as a completed download merely because an object exists at a predictable path.

The publication boundary can use a job state and finalized artifact reference. If generation fails, retain a bounded failure record and clean only owned temporary artifacts under the retention policy. Do not delete unrelated storage paths based on unvalidated job input. The worker should derive artifact locations from server-controlled identifiers and verify containment in any local test harness.

Cancellation needs its own semantics. A cancelled job may already have consumed resources or written a partial artifact. The worker should observe cancellation at safe points and stop publishing a completed result if cancellation is authoritative. A request to cancel is not proof that all work stopped immediately; report the actual terminal state.

## Retry and duplicate job creation

A browser can lose the response to an export-creation request. A proposed idempotency key can recover the same accepted job when the query fingerprint matches. Reusing the key for a changed filter should produce a conflict or a deliberate new job, not silently return a file for the old query. This is the same identity principle as submissions, applied to a different effect and retention policy.

Worker retries should resume or restart generation according to the artifact format and snapshot guarantees. If restarting, avoid publishing two conflicting final artifacts for one job. If resuming, retain a trustworthy checkpoint that identifies emitted rows and query position. Do not assume a cursor from a live query remains valid indefinitely across worker restarts.

## Required evidence

Test a filter accepted at creation and changed in the UI afterward; permission revoked before download; response inserted during generation; worker failure after a partial file; cancellation near completion; repeated creation with the same query; repeated key with a different query; and historical versions with incompatible labels. Each scenario should identify job state, artifact visibility, row population, and authorization result.

A pure job-state model can establish transition rules. An isolated streaming test can verify CSV content and cleanup ownership. A database integration can verify snapshot semantics. A browser test can verify progress and download feedback. The capstone report should not treat one layer's green result as proof of all four.

## Exercises

**FF-42A, eight points:** Define the immutable export specification and manifest, including historical schema mappings and snapshot/count semantics. Explain why exporting the loaded browser page is insufficient.

**FF-42B, six points:** Specify authorization at creation, worker execution, and download, including revocation and already downloaded copies. Design scoped job/artifact identity and retention.

**FF-42C, six points:** Build the adverse scenario matrix for retries, partial artifacts, cancellation, and concurrent data changes. State the finalization boundary and evidence needed for each layer.

## Assessment standard

A successful export job produces an artifact whose contents, authority, and observation time can be explained after the UI that requested it is gone. The job is not complete merely because bytes were written. It is complete when the chosen population was emitted, the artifact was finalized, and access follows the declared policy.
