# 48. Final defense: the research launch

This final case brings the course together around one synthetic launch. It is an independent assessment rather than another implementation tutorial. Use the original [API](../../apps/api/src/app.ts), [web integration](../../apps/web/src/App.tsx), [publication repository](../../packages/data/src/publications.ts), and [submission repository](../../packages/data/src/submissions.ts) as current-behavior anchors. The [final review](review-15-release-evidence-and-final-defense.md) provides scoring guidance after your submission.

## The launch scenario

Workspace Acme prepares a customer-research form. An editor changes a choice label and adds a conditional consent field while another editor reorders pages. A publisher creates the public snapshot under a research slug. Respondents begin answering. During the campaign, the team corrects a required question and republishes. One respondent is offline, one retries after a lost response, and an analyst starts an export while new submissions arrive.

The team later sees a high completion rate, a strange median duration label, a duplicate-looking pair of submissions, and a report that contains fewer rows than expected. Your task is to separate current demo behavior from proposed production behavior and produce a coherent launch readiness and incident analysis package. Do not assume all proposed chapters have already been implemented merely because the course describes them.

Start by identifying which requested operations the current App actually connects to repositories or HTTP. The builder's readiness message, demo save callback, public fixed receipt, local multi-page completion, and fixture analytics are important boundaries. A production launch plan must replace or explicitly limit those demo paths before claiming durable end-to-end behavior.

## Part one: identity ledger

Create a ledger containing workspace, form, field, option, page, publication, slug, response attempt, submission, journey, export job, and request correlation identities. For each, name its owner, lifetime, and whether it can change while another identity remains stable. The ledger should explain why a slug can remain the same while publication changes and why a request can change while a logical response attempt remains the same.

Use the ledger to analyze the choice-label edit. If meaning is unchanged, option identity may remain stable; if meaning changes, a new identity or explicit historical mapping may be needed. Analyze the page reorder separately from field identity and schema field order. Do not collapse every change into a single form version without explaining which contract that version governs.

The ledger should also identify identities absent from the current implementation, such as a durable journey or export-job identity. Mark them as proposed. A blank cell is more honest than assigning an existing field a new meaning it does not support.

## Part two: acceptance and observation timeline

Draw a timeline for draft edit, local persistence, conditional server save, publication creation, public form load, response submission, business event, analytics projection, and export finalization. Mark the authority for each acceptance point and the UI observation that follows it. Some current paths are local demonstrations; annotate those rather than pretending a network transaction occurs.

Then place failures between acceptance and observation. The draft save response is lost. The publication response is lost. The submission response is lost after republishing. The export file is partly written before a worker stops. Each case needs a different recovery identity and retained evidence. A generic retry button cannot safely resolve all four without knowing which effect is being repeated.

For publication, repeated publish currently creates another snapshot rather than replaying a retained publish operation. For submission, the key is scoped by publication and current route validation precedes repository lookup. For export, the current UI has no background job at all. These facts should guide the proposal and incident analysis instead of being overwritten by an idealized architecture diagram.

## Part three: respondent work preservation

Design recovery for the offline respondent whose stored session refers to the earlier publication and flow. Decide whether they can finish that publication, must review a migrated draft, or receive a latest-only mismatch. Preserve original answers and explain any changed meaning. A session that says completed locally is not automatically an accepted submission.

For the respondent with a lost response, retain the immutable operation payload and publication binding under the proposed protocol. If the current implementation created P1/K and later P2/K, investigate those identities before declaring the pair accidental duplicates. Matching answer text alone is insufficient evidence to delete one record.

For hidden consent, trace retained local state, FormData collection, visible-only validation, and final server validation. The launch contract must decide whether hidden means not applicable, empty, false, or retained draft data. This decision affects both respondent UX and analytics; it cannot be left to an incidental object spread.

## Part four: analytical and export interpretation

Explain the high completion rate using the exact journey predicate and population. Identify whether telemetry rows are unique, whether completion means navigation or accepted submission, and whether the observation window treats active journeys as drop-offs. Explain the median display by separating eligible durations from formatting. Do not change the underlying data merely to make a suspicious number look plausible.

For the short export, determine whether the UI received all responses or only a page, whether the export included all local matches or visible rows, and whether the query population changed during generation. Include publication-version mappings so old and new question meanings are not merged silently. A file can be syntactically valid CSV while incomplete or semantically misleading.

The final report should name the denominator and provenance of every metric and artifact. If evidence is missing, state which conclusion remains unknown and which bounded query or test would resolve it. The goal is a defensible analysis, not a forced single root cause for every symptom.

## Part five: release evidence

Prepare a change-based verification plan that maps each proposed integration to focused tests and broader gates where appropriate. Include API negative-path call absence, durable concurrency, publication-bound retry scenarios, renderer payload shape, offline recovery schedules, export authorization, and analytics presentation boundaries. Distinguish model checks from component, API, storage, and browser evidence.

The root gate and raw bundle budget can support release confidence, but they do not prove the demo paths are connected to durable services. A passing accessibility smoke audit excludes color contrast and covers a representative fixture, not every new interaction state. A successful pure submission model proves its six contracts, not the production database. The release report should retain these limits visibly.

## Submission format and scoring

Submit five artifacts: identity ledger, acceptance timeline, respondent recovery plan, analytics/export incident report, and verification matrix. Add a concise list of current implemented behavior versus proposed launch work. Use synthetic examples and exact source anchors. No deployment, installation, runtime modification, or live-data cleanup is required to complete this defense.

Score twenty points for each artifact. Full credit requires consistency between them: the publication identity used in the retry plan must match the interpretation used in analytics; the export snapshot policy must match its count claim; the recovery message must match retained evidence. A polished diagram with contradictory contracts should not pass.

## Exercises

**FF-48A, eight points:** Produce the identity ledger and acceptance timeline, marking demo boundaries and missing proposed identities. Explain three cases where a stable-looking UI label hides a changed underlying contract.

**FF-48B, six points:** Write respondent recovery and analytics/export diagnoses for the launch scenario. Preserve work, avoid unsupported deletion, and distinguish interpretation, acceptance, and observation.

**FF-48C, six points:** Produce the release verification matrix and final implementation/proposal inventory. State the strongest launch claim supported by current evidence and the concrete work required before making a stronger claim.

## Final oral challenge

Ask a reviewer to change one timing assumption and one identity assumption. For example, move republishing before the first submission rather than before its retry, and let two workspaces share the same form ID. Defend the revised outcome from your contracts. A learner who can adapt the explanation without inventing guarantees has reached the course's objective: reasoning precisely about a real application as its data, users, and asynchronous boundaries evolve.
