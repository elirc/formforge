# 07. Builder transformations preserve some identities and share others

After the opening integration route, return to the pure editing core. [builder.ts](../../packages/core/src/builder.ts) contains createField and builderReducer. This code is small enough to trace, yet it exposes several distinctions that matter when adding editor features: field identity versus position, structural copying versus deep isolation, selected identity versus existence, and typed actions versus runtime validation.

## An action is not a general patch

BuilderAction lists specific operations. field.update permits label and description, while field.require changes required. Moving, duplicating, and removing have their own branches. This constrained vocabulary makes intent reviewable. A generic assign-any-property action could bypass kind-specific assumptions or mutate identity without updating dependent state.

The reducer still relies on its callers. field.add appends the supplied field and selects its id; it does not call parseFormSchema or reject an id already present. field.duplicate accepts a supplied newId without checking uniqueness. The semantic schema validator can later report duplicate field ids, but that does not mean every intermediate reducer state is guaranteed unique. A type-safe action union cannot express freshness of an arbitrary string by itself.

Work a duplicate-id example in an owned model rather than changing the application. If two fields share id A, field.update maps over the entire array and updates both matching entries. field.move uses findIndex and moves the first match. field.remove filters out every match. The same invalid identity state therefore produces different multiplicity behavior across operations. This is a concrete reason to enforce identity at a deliberate boundary rather than assuming all consumers repair it consistently.

## Selection follows identity

field.select changes selection only when the requested field id exists. Unknown selection returns the original state. field.add selects the added field. field.duplicate selects newId. Removing the selected field chooses the first remaining field's id, or undefined if none remain. Removing another field keeps the current selected id.

These decisions are not merely visual. A property panel that uses selectedFieldId must remain associated with the intended record after reordering. Storing an array index instead could make the panel edit a different field when another field is inserted before it. The reducer's identity-based selection avoids that particular positional hazard under valid unique ids.

A future multi-selection feature needs a new contract. Should removing one selected field preserve the others? Does duplicating a selection preserve relative order? Which field receives keyboard focus? Those questions cannot be answered by changing a string to an array and relying on existing branches. The exercise below asks for a specification before implementation.

## Moving uses a bounded target

field.move locates the source, clamps targetIndex between zero and the last current index, returns unchanged when the target equals source, copies the array, removes the source item, and inserts it at the target. The target is interpreted as the final insertion index used after removal. Trace both forward and backward moves with distinct ids.

For fields A, B, C, D, moving B to target three yields A, C, D, B. Moving D to target zero yields D, A, B, C. An excessively large finite index clamps to the end. A missing source returns the original state. These ordinary cases establish intended bounds, but the type number does not by itself rule out NaN or fractions from an unchecked runtime caller. A proposed public action parser should define those cases rather than relying on accidental array coercion.

Do not confuse returning the original state with a deep equality guarantee across every branch. Some branches create a new wrapper even when no field matches. Referential identity can affect rendering optimizations, while semantic contents remain unchanged. A performance exercise needs to identify which equality it measures.

## Duplication is shallow at the field boundary

field.duplicate spreads source, replaces id, and appends copy to the label. If source is a choice field, its nested options array remains the same reference in this branch. That is a source fact. It is not automatically a user-visible bug if all later editing operations preserve immutable ownership, but it matters when designing option editors or tests.

A learner should distinguish two claims: the duplicate has a new field id, and the duplicate owns independent nested option objects. The first follows from assigning newId; the second does not follow from a shallow spread. A test that mutates a nested option on the duplicate in a direct fixture can expose the shared reference, but should label that as an alias characterization unless the real UI performs such mutation.

The draft repository later uses structuredClone when storing schemas. That boundary does not retroactively make two fields inside the same input schema independent during editing. Different layers protect different ownership relationships. This connects the chapter to the earlier defensive-copy lesson without treating every copy operation as equivalent.

## Content fields keep a special required rule

createField content sets required false. field.require deliberately skips content kinds, preserving their nonresponse role. A required-toggle UI should respect that distinction. A refactor that blindly maps required onto every field could construct a content field incompatible with the parser's literal-false rule.

A good regression starts from a valid content field, dispatches field.require true, and inspects the resulting content field. It should remain false. A separate text field should become true under the same action type, so the test does not accidentally bless an implementation that ignores all required changes.

## Independent practice

**FF-07A, eight points:** Build an action ledger for add, select missing, move forward, duplicate, and remove selected. Record field order, selected id, and whether the source state object is returned. Include distinct identities so position mistakes are visible.

**FF-07B, six points:** Characterize duplicate choice-field aliases using reference observations and a nested mutation in a disposable fixture. Then propose an immutable option-editing action or deep-copy policy. State which behavior is current and which is proposed.

**FF-07C, six points:** Specify a runtime boundary for incoming builder actions that prevents duplicate field ids and invalid movement indices. Explain whether invalid action should reject, no-op, or return a structured issue, and how that choice affects a saved draft.

Review with [the pure-core guide](review-03-builder-and-rule-graphs.md). Continue into [rule evaluation and dependency graphs](08-rule-values-and-dependency-graphs.md).
