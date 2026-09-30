# 12. Change summaries and mention boundaries

Collaboration features often turn a small amount of source data into a confident-looking narrative: a change summary, an activity feed, or a list of mentioned people. FormForge's [collaboration.ts](../../packages/core/src/collaboration.ts) contains pure helpers for mentions and schema differences. These helpers are useful, but neither a readable summary nor a parsed handle proves a complete audit or notification workflow.

Read [collaboration.test.ts](../../packages/core/src/collaboration.test.ts) for current examples. The tests establish normalized unique mentions excluding an ordinary email address, a particular sequence of schema change kinds, and no changes for a cloned identical snapshot. Further claims need additional evidence.

## Schema changes are keyed by field identity

diffFormSchemas begins by comparing form title. It then builds maps from field ids to fields for before and after. It walks before.fields to report removed fields, then after.fields to report added or updated fields. Output order therefore has a specific shape: optional form rename, removals in old order, then additions/updates in new order.

Stable ids let the helper recognize a field whose label changed as an update rather than a removal plus addition. If the same conceptual field receives a different id, the helper cannot infer the user's intention from similar text; it reports removal and addition. This is appropriate for identity-based comparison, but the UI should not claim it has detected semantic equivalence between arbitrary records.

Duplicate ids are another important precondition. Map construction retains one entry per id, while the outer loops still traverse the arrays. Invalid duplicate-id schemas can therefore produce summaries that do not match a simple one-field-per-id interpretation. The validator in another module can report duplicate ids, but this helper does not invoke it. A caller needing trustworthy audit output must decide how invalid snapshots are handled.

## Some changes are intentionally outside the summary

The helper compares the form's title, but does not report a change to the form description or id through a top-level change kind. Field order changes alone do not produce field.updated, because changedProperties compares properties of matched fields, not their array positions. A reorder can therefore yield an empty changes array when field objects otherwise match.

This is a crucial limit for review UI. Empty summary means no changes detected by this helper's current categories, not byte-identical schemas and not necessarily no user-visible difference. A publish confirmation that relies on this helper as a complete equality check could miss a reorder or description change.

A proposed field.moved category needs an ordering policy. Moving one field shifts several indices; reporting every shifted field as moved can be noisy. A longest-common-subsequence approach, explicit action history, or a simpler position-difference report each has different semantics. Define the desired explanation before selecting an algorithm. The existing helper has no movement category to extend automatically.

## Property comparison is serialized representation comparison

changedProperties forms a union of keys and compares JSON.stringify results for each property except id. This catches many ordinary primitive and nested-data changes. It is not a general semantic deep-equality function. Object property order inside a nested value can affect serialized representation, undefined can behave differently from absent values at different nesting levels, and unsupported runtime values are outside the typed schema's intended domain.

The returned summary lists property names, not full before/after payloads. A changed options array can be summarized as options without explaining which choice was added or relabeled. That may be enough for a compact activity feed, but a conflict resolution screen needs more evidence before asking a user to choose between schemas.

The distinction protects privacy as well as correctness. A human-readable summary can avoid copying all form contents into logs, but field labels and form titles may still contain sensitive text. A future audit sink should define data retention and access rather than assuming summaries are harmless because they are shorter than the source object.

## Mentions are lexical matches

parseMentions uses a regular expression with a negative lookbehind for a word character or at-sign before the mention marker. It accepts one to thirty-nine letters, digits, underscores, or hyphens, then a word boundary. Matches are lowercased with locale-aware conversion and deduplicated through a Set, preserving first encountered normalized order.

The ordinary email example dev@example.com is excluded because the at-sign is preceded by a word character. That does not mean the helper implements a complete email parser or a Markdown-aware mention grammar. It does not inspect whether a match appears inside a code block, a link, a quotation, or escaped text. A notification feature must decide whether those contexts count.

The word boundary also interacts with the allowed trailing hyphen. Rather than inferring every edge case from the broad character class, construct exact strings and inspect the regular expression behavior in an owned model. The current test's simple handles are a starting point, not exhaustive language coverage.

## A handle is not a recipient

The helper returns strings. It does not resolve accounts, verify workspace membership, authorize notification, rate-limit delivery, or send messages. Those are separate application responsibilities. A course extension can propose them, but must not treat the existence of mentions on CollaborationComment as evidence that notifications are already delivered.

A safe proposed workflow would parse candidate handles, resolve them within a specified workspace, apply visibility and notification preferences, and create a delivery intent tied to a stable comment identity. Retry behavior then needs its own key so repeated processing does not notify recipients repeatedly. The lexical parser alone supplies none of these guarantees.

## Incident: a publish screen says nothing changed

Reorder two fields without modifying their objects, then run diffFormSchemas in a disposable fixture. If the result is empty, compare that with the rendered form order. The discrepancy reveals a scope mismatch between summary categories and the proposed screen's promise, not necessarily a defect in the helper's documented purpose.

A good repair proposal can broaden the summary, narrow the screen wording, or use a separate equality check for publish confirmation. Which option is appropriate depends on the product. The investigation should retain a minimal reorder fixture and avoid replacing the helper with an unreviewed stringify-everything comparison that changes unrelated behavior.

**FF-12A, eight points:** Predict summary kind order for title rename, field removal, addition, and property change. Add reorder-only and form-description-only cases and state why empty does not prove schema equality.

**FF-12B, six points:** Design an explicit movement-summary policy and a fixture where moving one field shifts several indices. Explain what your policy reports and why.

**FF-12C, six points:** Separate mention parsing from recipient resolution and delivery. Propose lexical edge-case tests plus a stable notification-attempt identity, clearly labeling the latter as unimplemented integration work.

Consult [the separate review](review-05-analytics-and-diff-limits.md), then return to [the route](README.md) for further modules.
