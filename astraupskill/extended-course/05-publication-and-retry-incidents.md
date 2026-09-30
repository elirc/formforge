# 05. Investigate publication and retry incidents

This chapter turns repository behavior into incident investigation. The objective is to explain a concrete observed result before proposing a stronger product contract. Use [publications.ts](../../packages/data/src/publications.ts), [submissions.ts](../../packages/data/src/submissions.ts), and [the API routes](../../apps/api/src/app.ts). The incidents use invented workspaces and responses; no real submissions or personal data are needed.

## Incident one: an old address still serves an old snapshot

A form owner publishes at spring-research, later publishes at autumn-research, and expects the first address to redirect. A public reader at spring-research still receives the old schema. Begin by asking whether redirect behavior exists in the repository interface. It offers publish, findBySlug, and listVersions. There is no redirect operation or current-slug field in this implementation.

Trace the two map updates. Each publication is appended to the selected slug's list and to the form's history. Changing slug creates another list entry under a different map key, while the earlier slug's list remains intact. findBySlug selects the last snapshot in the particular slug list. The observation is therefore consistent with current behavior.

A proposed address-migration feature needs explicit decisions. Should the old address stay frozen, redirect, disappear, or remain independently publishable? What happens to an in-progress submission at the old address? Is the old slug permanently reserved against other forms? The current owner check uses the first stored publication under that slug, so reservation persists for the lifetime of this in-memory repository. Do not remove that check merely to make address reuse convenient.

## Incident two: a changed answer receives an old receipt

A caller sends idempotency key attempt-cedar with answers selecting blue. It receives a created result. The caller edits its answer to green and retries with the same key against the same publication. The repository returns duplicate with the original blue answers. This is not a merge, and it is not a second accepted response.

The first question is whether the caller intended a transport retry or a new logical submission. The current repository treats equal publication/key pairs as the same attempt regardless of changed content. The route still validates the newly supplied answers before the repository call. Consequently, an invalid changed payload can fail validation instead of returning the old receipt, while a valid changed payload can reach duplicate handling. Repository-only and route-level retry claims need to retain this ordering difference.

A stronger proposal can record a canonical fingerprint with the initial receipt and reject a reused key with a different fingerprint. But canonicalization is a domain decision. Answer object property order should usually not distinguish equivalent responses, while an omitted value and false may or may not be equivalent for a particular field. The schema and its snapshot identity should be part of the reasoning. Raw JSON.stringify is an implementation choice, not a definition of user intent.

## Incident three: the same caller key creates another record

A public slug is republished between attempts. The second route call resolves a new publication id. The same caller key now occupies a different repository namespace, so it can create another submission. A report saying idempotency is broken omits the fact that identity changed.

This case connects address lookup with immutable snapshot identity. If product requirements demand one stable attempt across republishing, the client may need an explicit snapshot token and a route that accepts or verifies it. The server needs a policy when the token refers to a superseded or unavailable snapshot. Alternatively, the product may intentionally accept a new response for each snapshot. Both can be coherent; neither follows automatically from the word retry.

## Rejected publication must not change either index

Consider another form trying to publish under an already-owned slug. The repository reads the first owner and throws PublicationSlugConflictError before constructing or storing the new publication. A focused test should read both the slug lookup and the attempted form's history after rejection. Checking only the HTTP 409 would miss an implementation that increments history before failing.

The same workspace does not grant ownership of every slug. The owner comparison includes both workspaceId and formId. A different form inside the same workspace must conflict. This is a particularly useful test because a broad workspace-only guard can pass ordinary cross-workspace cases while allowing accidental reassignment within one workspace.

For the durable-adapter proposal, separate slug reservations from immutable publication rows. A unique constraint on slug in a table intended to hold many historical snapshots would prevent a second publication at the same address. A useful schema might represent a unique reservation row and many snapshot rows referring to it. The exact schema is learner work, but its cardinalities must support the existing behavior before transaction details are debated.

## The incident artifact

Write one page per incident with observed request identity, retained server state, relevant lookup, and the smallest reproducing fixture. Add a separate proposed-contract section. Keep response answers synthetic and minimal; a color choice is enough to expose the changed-payload policy. The artifact should explain whether the current result violates a stated promise or reveals an unstated assumption.

**FF-05A, eight points:** Reproduce the three-address trace from chapter one as an incident report. Propose one migration policy and describe its effect on old address readers and pending submissions.

**FF-05B, six points:** Design a retry-equivalence matrix covering identical answers, reordered properties, changed valid answers, changed invalid answers, and a newly resolved publication. Name the layer controlling each result.

**FF-05C, six points:** Sketch reservation and snapshot tables for a durable adapter. Show how a repeated owner publication succeeds while another form conflicts, and identify the transaction that updates address lookup and form history together.

Check [the scheduling and integration review](review-02-scheduling-and-integration.md) after your own design. Finish the opening route with [the independent capstone](06-capstone-connect-the-real-boundaries.md).
