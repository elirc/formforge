# Review 09. Durable repository contracts

This guide reviews chapters 23 through 26. The existing repositories are in-memory implementations. Database transactions, durable receipts, publication-bound sessions, outboxes, and historical mapping manifests are proposals. Award credit for preserving observable contracts under new failure modes, not for selecting a particular storage product.

## FF-23A: atomic draft effects

The naive race lets both writers read version five and later write version six, losing one schema while both report success. An atomic conditional update constrains workspace, form, and expected version at the storage authority. Creation needs a unique workspace/form key so concurrent expected-zero attempts cannot create two logical drafts. A physical primary key alone does not enforce that domain identity.

Award four points for the race and conditional update, two for concurrent creation, and two for scope. An async function does not serialize work across independent clients. The in-memory implementation avoids an await in its comparison/set span, but that property does not transfer automatically to a database adapter with separate round trips.

## FF-23B: conflict snapshots and uncertainty

A post-failure read can return a row newer than the exact state that defeated the conditional update. The adapter should define whether current means that later observed snapshot or a precise atomic conflict observation. A merge based on the returned version can conflict again, so preserve the user's local proposal and require a deliberate retry rather than silently adopting the version and overwriting.

A committed save with a lost response can throw or appear failed to the caller while having advanced the version. Optimistic concurrency prevents an unsafe stale overwrite but does not replay the original successful result. Award two points for conflict-current timing, two for uncertain recovery, and two for the concurrency/idempotency distinction. A stronger save-operation receipt is a contract extension, not an existing feature.

## FF-23C: adapter evidence

The plan should use two independent clients against one isolated authoritative store for concurrency claims. It should cover create races, update races, workspace isolation, stale versions, input/output mutation isolation, timestamp authority, and a committed-but-response-lost scenario where feasible. The report must identify which faults are injected models and which cross real driver or process boundaries.

Award three points for meaningful concurrency cases, two for copy/time semantics, and one for evidence limitations. Two wrappers around one fake Map can test interface behavior but cannot prove database locking, uniqueness enforcement, or transaction isolation. No exercise requires installing or connecting to production storage.

## FF-24A: reservation and lineage

For alpha/beta/alpha, the form versions are one, two, three; alpha resolves to three and beta to two. The old slug is not automatically redirected by a later publication elsewhere. A reservation structure enforces one workspace/form owner per slug, while snapshot storage permits many publications under that slug. The form's version uniqueness is scoped to workspace/form.

Award three points for the trace, three for the two storage roles, and two for uniqueness scope. A unique slug on every snapshot row incorrectly prohibits repeated publication by the same owner. Comparing only formId ignores workspace scope and can allow or reject ownership incorrectly.

## FF-24B: concurrent publication

Version allocation must be serialized or constrained so two publications cannot silently receive the same owner/version. A transaction can coordinate a new slug reservation and snapshot insertion when the intended contract is all-or-nothing publication. Two forms racing for one unused slug should yield one owner and a mapped domain conflict for the loser. Unexpected infrastructure failures remain distinct from known ownership conflicts.

Award two points for version allocation, two for reservation/snapshot atomicity, and two for race/error handling. If the product intentionally supports a reservation without a publication, that is a separate explicit feature. Do not accidentally introduce it through a failed second write while claiming the original publish contract is preserved.

## FF-24C: lifecycle and snapshot package

A coherent extension can archive a publication, redirect a slug, or release ownership under a clearly stated policy. It must define public lookup and submission behavior for old links and loaded respondent forms. The immutable package should include the dependencies needed to interpret the response, such as rules and flow definitions if those features are published, rather than consulting mutable global defaults.

Award three points for the lifecycle effects and three for historical interpretation. Readonly types alone do not enforce operational immutability. If exceptional redaction or correction is allowed, document its provenance and effect on old submissions rather than quietly editing snapshots while retaining an unqualified immutability claim.

## FF-25A: replay layers

At repository level, the first record for publication/key wins and later answers are not compared. A duplicate returns the original cloned submission. At route level, slug resolution, body/key parsing, and validation occur before the repository call. Therefore, an invalid retry can fail before replay lookup. The observable HTTP behavior is not simply return original result for every repeated key.

Award four points for the repository rule, two for route ordering, and two for a clearly labeled mismatch proposal. A proposed same-key/different-payload conflict needs a fingerprint definition and result mapping. It is not already implemented merely because the key is called idempotencyKey.

## FF-25B: republish race

The first request stores P1/K. After the slug points to P2, the retry resolves P2 and uses P2/K, so P1's retained record does not deduplicate it. The retry can fail P2 validation or create a new P2 submission. A publication-bound response session avoids silently changing the schema contract, while a latest-only policy should return an explicit refresh/version conflict and preserve the respondent's draft.

Award three points for the scope trace and three for a coherent policy. The slug is a mutable discovery alias; the publication ID identifies an immutable snapshot. Reusing the same public URL is not enough to preserve operation identity across republishing.

## FF-25C: canonical payloads and downstream effects

The key should remain stable for one logical response attempt and change for a deliberate new response. Canonicalization must define ordering, value types, omission, empty string, false, and unknown keys. A durable uniqueness rule on publication/key coordinates concurrent creation; matching and mismatched retries then follow the declared payload policy. A downstream event intent can be stored transactionally with the submission in a proposed outbox, but delivery still needs its own retry handling.

Award two points for key and payload lifecycle, two for durable coordination, and two for downstream effect boundaries. A unique submission row does not establish unique email delivery. Likewise, canonicalizing numeric-looking strings without a domain rule can erase meaningful formatting rather than merely improve deduplication.

## FF-26A: compatibility matrix

A label clarification may preserve identity if meaning is unchanged. A unit change can be type-compatible but semantically incompatible, as monthly and annual budget values illustrate. Optional-to-required affects new-response expectations without invalidating old optional omissions. An option rename can preserve identity when meaning remains stable; reusing an ID for a new meaning should not. A type change requires an explicit historical interpretation or migration policy.

Award four points for the six cases, two for identity distinctions, and two for a semantic counterexample. Old responses remain interpretable under their original publication even when they would fail the latest schema. Validating all history against the newest schema is not a sound corruption detector.

## FF-26B: eligibility denominator

The report should include only the declared publication population and distinguish respondents who were eligible for the question from those never asked. Optional omissions, hidden fields, and normalized empty values may need separate states. If the current stored data cannot distinguish them, report that limitation rather than inventing exposure evidence. Requiredness in a later version does not retroactively change earlier obligations.

Award two points for population and eligibility, two for missingness semantics, and two for required data and honest limitations. A correct division can still answer the wrong question when all historical responses are used as the denominator for a question introduced later.

## FF-26C: provenance-preserving export

The export should retain publication identity and stable field identity, with historical labels or a companion schema/mapping manifest. Ambiguous mappings remain separate or explicitly unmapped. Original values are preserved so a future analyst can revisit the mapping. A wide combined column is acceptable only when its cross-version interpretation is documented.

Award two points for provenance, two for mapping honesty, and two for separating semantic correctness from CSV escaping. The existing CSV helper serializes caller-selected field IDs; it does not automatically construct a historical schema join. Correct quoting and formula-prefix handling cannot repair a mislabeled or semantically mixed column.

## Independent adapter defense

Ask a reviewer to choose one race: two draft saves, two slug claims, a lost submission response followed by republish, or a report spanning a unit change. State the identity scope, authoritative operation, retained evidence, and result observed by the loser or retrying client. Then identify the smallest experiment that crosses the relevant boundary. A good design remains coherent when the reviewer changes timing because its invariants live at the authority that can enforce them.
