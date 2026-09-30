# 01. Follow three independent identities

A reliable form builder needs more than a field called version. FormForge keeps an editable draft, publishes snapshots, and accepts responses against a selected snapshot. Those objects have related lifetimes but different identities. This chapter builds the vocabulary needed to reason about all three without treating a successful screen update as proof of stored data.

Open [drafts.ts](../../packages/data/src/drafts.ts), [publications.ts](../../packages/data/src/publications.ts), and [submissions.ts](../../packages/data/src/submissions.ts). Keep the files side by side. These repositories are small enough to read completely. Your first deliverable is an identity ledger, not a diagram copied from a generic architecture article.

## The draft belongs to a workspace and form

A draft lookup takes workspaceId and formId. The implementation joins them with a null character for its private map key. The record contains those identities, the schema, a numerical version, and an update timestamp. Save compares the caller's expected version with the existing record's version, using zero when no record exists. A successful initial save therefore expects zero and produces version one.

The version answers which accepted draft state the caller last observed. It is not a global sequence across every form. Two distinct forms can both have draft version seven without colliding. A timestamp answers a different question: when the injected clock said this save occurred. If two saves receive equal timestamps, their versions still distinguish the accepted states. Treating the timestamp as a unique revision would invent a contract the repository does not supply.

The schema also contains an id. That apparent duplication creates a boundary worth checking. The HTTP draft route refuses a parsed schema whose id differs from the route's formId. The repository interface itself accepts a FormSchema and does not repeat that route agreement check. A unit test calling the repository directly and an injected HTTP request therefore exercise different validation boundaries. Neither should be described as a test of the other.

## A publication is a new snapshot

Publication carries workspaceId, formId, slug, version, and its own opaque id. The slug is a public lookup address; the id identifies the individual snapshot. The per-form version is derived from the length of that form's publication history. It is independent of the draft version and increases across changes of slug.

Work a concrete trace. Workspace cedar publishes form survey under cedar-survey. Call that snapshot P1 and display version one. The same form publishes under research-autumn, producing P2 and display version two. Looking up cedar-survey still returns the latest publication stored under that old slug. The repository does not create a redirect to research-autumn. Publishing again under cedar-survey makes P3, version three, the latest result for that address. P2 remains the latest result for research-autumn until that address receives another publication.

These outcomes follow from two indexes: one by slug and one by workspace/form. They answer different questions. An implementation that numbers only within each slug would restart numbering when the address changes. An implementation that uses formId as the snapshot id would collapse distinct publications even while displaying different version labels. Both mistakes can look convincing in a UI that shows only title and slug.

## A response attempt belongs to one publication

The submission repository indexes by publicationId and idempotencyKey. A repeated pair returns the original submission as duplicate. The same caller key under a different publication is a different namespace and can create another record. This is why snapshot identity affects retry behavior, even though the code that generates the snapshot id is in another file.

Current duplicate handling does not compare the supplied answers with the original answers. If the first attempt stores blue and a retry supplies green with the same pair, the stored blue response is returned. A future changed-payload conflict policy is a feature proposal, not an existing protection. A good identity ledger includes both the namespace and the equivalence rule, because knowing the key alone does not explain what happens when payloads disagree.

## The API resolves the address before submitting

Read [app.ts](../../apps/api/src/app.ts). The submission route starts from a slug, resolves its current publication, parses answers, validates them against that publication's schema, then calls submissions.submit with the publication id. The browser does not directly select that id through the route path.

This creates an important investigation scenario. A user retries the same slug and caller key after a new snapshot is published at that slug. The route can resolve a different publication, and the repository's key pair can therefore differ. Do not promise that a caller key deduplicates every request forever across changes of public form. The intended product policy needs to decide whether an attempt pins a snapshot or follows the current address. This chapter records the current trace without changing it.

## Evidence exercise

Create a table with columns for operation, draft version, publication id, publication version, slug lookup result, and submission identity. Use fixed symbolic ids in your prediction; real UUID strings add noise without improving the reasoning. Mark values that an operation does not touch with unchanged rather than inventing a new number.

**FF-01A, eight points:** Predict the three-publication trace above, including both slug lookups after the third publication. Explain why the form version and public address cannot be the snapshot's unique identity.

**FF-01B, six points:** Compare two submissions with the same caller key under P1 and P2, then two under P1 with changed answers. State created/duplicate and which payload survives. Identify the proposed behavior you would add if changed answers should conflict.

**FF-01C, six points:** Draw the route-to-repository boundary for a schema whose id disagrees with formId. Name which layer rejects it and explain why a repository-only test cannot prove that the HTTP route performs that check.

Attempt the ledger before opening [the review guide](review-01-identity-and-validation.md). Continue with [validation boundaries](02-parse-validate-and-publish.md).
