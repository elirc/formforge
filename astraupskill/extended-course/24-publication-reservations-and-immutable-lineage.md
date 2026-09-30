# 24. Publication reservations and immutable lineage

The publication repository maintains two indexes: history by public slug and history by workspace/form. Their roles differ. This chapter designs a durable representation that preserves those roles without turning slug ownership into an accidental restriction on publication history. Read [publications.ts](../../packages/data/src/publications.ts) and the publication route in [app.ts](../../apps/api/src/app.ts). Answers are in the [durable repository review](review-09-durable-repository-contracts.md).

## Reconstruct the current lineage

When publishing, the repository looks up the slug's history and treats its first publication as the owner. If that owner's workspace or form differs from the input, it throws a slug conflict. For the same owner, publication can continue under that slug. Separately, the repository finds the form's complete history and chooses the next version as its length plus one. It creates a new publication ID, clones the schema, and appends the snapshot to both indexes.

Therefore, a public slug can have multiple immutable snapshots, and a form's version sequence spans its publication history even when the slug changes. Looking up a slug returns the latest publication under that particular slug. Changing to another slug does not automatically redirect the old slug to the newest publication under the new one. That distinction should remain visible in any durable schema or product migration.

Work an example. Form F publishes version one under alpha, version two under beta, and version three under alpha again. The form history is one, two, three. Alpha resolves to version three; beta still resolves to version two. A different form cannot claim either reserved slug while the repository retains those histories. This is more specific than a generic statement that every slug points to the latest form version.

## Separate ownership from snapshots

A proposed relational design can use a slug reservation table keyed uniquely by slug and containing the owning workspace/form pair. A publication snapshot table contains a unique publication ID, owner, version, slug, schema, and timestamp. A uniqueness rule on owner plus version protects the form sequence. The reservation row and snapshot rows express different cardinalities: one owner per slug, many snapshots per slug.

Putting a unique constraint on the snapshot table's slug column would reject a second publication by the same owner, contradicting current behavior. Conversely, omitting a reservation or equivalent atomic ownership check can let two forms publish the same slug concurrently. The schema should encode the actual invariant rather than relying on a friendly preflight query that can race.

The reservation's owner comparison must include both workspace and form. A form ID alone is not globally authoritative across workspaces. The application route also performs schema identity checks, but a durable repository should document which invariants it assumes and which it enforces independently. A repository called outside the HTTP adapter should not accidentally violate the storage's fundamental uniqueness constraints.

## Atomic publication under concurrency

Two publications of the same form can both observe the same history length in a naive durable port and choose the same next version. A unique constraint can detect the collision, but the adapter still needs a policy: serialize version allocation, retry the transaction with a fresh sequence, or return a defined conflict. The current interface does not expose an expected publication version, so adding a client-visible optimistic precondition would be a deliberate API change.

Similarly, acquiring a new slug reservation and inserting the publication should be coordinated. If reservation succeeds but snapshot creation fails, the service may reserve a slug without a usable publication. That may be acceptable as an explicit reservation feature, but it is not the current publish method's apparent all-at-once behavior. If the intended contract is publish or no new reservation, use a transaction or recoverable protocol that enforces it.

Consider two different forms racing for an unused slug. One must become the owner and the other must receive the domain conflict. Do not let the losing request overwrite ownership or surface a raw database error as an unexplained 500. The adapter should map known uniqueness outcomes into PublicationSlugConflictError while preserving unexpected infrastructure failures for proper diagnosis.

## Immutability is an operational promise

The in-memory repository clones the schema when publishing and clones records when returning them. This prevents callers from mutating historical snapshots through shared references. A durable design should preserve snapshot immutability through its write API and access policy, not merely through readonly TypeScript fields. An administrative update statement can still alter a row unless the operational design controls it.

If a publication contains a mistake, decide whether correction creates a new version or whether an exceptional redaction process can modify stored history. Those are different contracts. A redaction requirement may be legitimate, but it must record what happened and how existing submissions or public links are interpreted afterward. Do not quietly add an update-publication method and continue describing all snapshots as immutable without qualification.

The schema snapshot also needs all interpretation dependencies required to render and validate it later. If visibility rules, flow definitions, or choice labels live elsewhere and change independently, a schema-only snapshot may not fully define the respondent experience. A proposed publication package should identify the complete versioned contract rather than relying on mutable global defaults.

## Slug lifecycle proposals

The current repository retains ownership through its in-memory histories. A durable product might later support unpublish, redirect, archive, or slug release. Each operation needs a policy for old links and submissions. Releasing a slug to a different owner can make a familiar URL refer to unrelated content, so it is not merely a storage cleanup task.

A redirect can preserve an old link while pointing to a new public location, but the server must define whether submission follows the redirect, which publication version is used, and whether a client that loaded an old schema can still submit. An archive can disable new responses while retaining historical records. A release can require a quarantine period or never be permitted. These are proposals; none should be inferred from findBySlug returning the last entry.

For a learning exercise, choose one lifecycle extension and write its effect on reservation, snapshot history, public lookup, and submission acceptance. A single boolean published flag is unlikely to express every distinction clearly. Prefer a small explicit state model over accumulating ambiguous flags with overlapping meanings.

## Exercises

**FF-24A, eight points:** Trace alpha/beta/alpha publication history and design reservation and snapshot tables or equivalent structures. Explain why unique snapshot slug is wrong and why ownership includes workspace and form.

**FF-24B, six points:** Design concurrent publication and slug-claim transactions. State how version allocation, reservation, snapshot insertion, and domain-error mapping behave under a race or mid-operation failure.

**FF-24C, six points:** Propose one slug lifecycle extension and an immutable publication package. Explain how old links and submissions retain a coherent interpretation, including dependencies such as rules or flow definitions if they are introduced.

## Review checkpoint

A strong design preserves lineage rather than merely storing the latest JSON. It can answer who owns a slug, which snapshot a link resolves to, what a form version means, and how concurrent publication preserves those answers. If any answer depends on whichever query happened to finish last, the durable contract is incomplete.
