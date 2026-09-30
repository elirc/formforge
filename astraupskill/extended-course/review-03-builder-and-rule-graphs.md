# Review 03. Builder identity and conditional-rule graphs

This guide covers FF-07 and FF-08. Try the hints before reading the worked reasoning. These exercises are pure-core investigations: they can establish behavior of named functions, but do not prove that a particular browser control or API route invokes those functions.

## FF-07A: order and selection have different keys

Hint: write the field-id array and selectedFieldId after every action.

Adding selects the new field. Selecting a missing id returns the original state. Moving B from A, B, C, D to index three produces A, C, D, B and preserves identity-based selection. Duplicating inserts immediately after the source, gives the new supplied id, appends copy to its label, and selects it. Removing that selected copy selects the first remaining field.

Award four points for exact arrays and selection, two for missing-source or unchanged-move behavior, and two for distinguishing reference identity from equivalent contents. Some map-based branches allocate wrappers even when there is no matching field. A no-op optimization proposal must preserve visible behavior but may deliberately change reference behavior; tests and performance claims should name which one they observe.

## FF-07B: shallow duplication is not nested isolation

Hint: compare source.options with duplicate.options before mutating anything.

For a choice field, the spread in field.duplicate retains the nested options array reference. A disposable test can demonstrate that alias, then mutate a nested option and observe both views. This is a characterization of the reducer output, not proof that the current browser mutates nested objects in place.

A proposed option-editing action can replace the options array and the selected option object immutably, preserving unrelated field objects. Alternatively, duplication can deep-copy nested field data. The choice should follow the desired ownership contract and test both the source and duplicate after editing. Award two points for the reference observation, two for the scoped claim, and two for a coherent proposal.

## FF-07C: freshness requires runtime policy

Hint: an arbitrary string typed as newId is not automatically new.

A runtime action boundary should inspect whether an added or duplicated id already exists and decide how to report rejection. Movement indices should be finite integers under a defined clamping or rejection policy. The existing reducer's TypeScript action type does not itself enforce these runtime facts for external input.

Award two points for each invariant and two for consistent failure behavior. A structured issue result is one valid proposal; throwing at an adapter is another if the UI handles it deliberately. Silently generating a different id can also be designed, but then the caller must receive the actual identity so selection and subsequent actions remain coherent.

## FF-08A: absence does not coerce into false

Hint: evaluate the strict comparison before applying any product intuition.

For equals false, missing is false, boolean false is true, empty string is false, and engineering is false. For notEquals engineering, missing, false, and empty string are true while engineering is false. Empty all evaluates true and empty any false. Required-answer validation has a separate empty helper and cannot replace these raw comparison results.

Award six points for the truth cases and two for the contract distinction. A proposed rule language may want an explicit answered predicate or a three-valued unknown state, but those are language changes. Adding them requires deciding how all and any combine unknowns; merely changing one comparison risks inconsistent semantics elsewhere.

## FF-08B: a repeated node is not necessarily a cycle

Hint: only membership in the active visiting path identifies the back edge here.

In A to B to C to A, the second encounter of A finds path A, B, C and adds that suffix to cyclic. All three are cycle members. In the diamond, D can be fully visited through B before C reaches it. The visited check then avoids repeating its work without reporting a cycle. A node D that depends on an existing A/B/C cycle is affected by that configuration but is not automatically itself part of the cycle suffix.

Award three points for the cycle trace and three for the diamond and affected-node distinction. A one-set algorithm that treats every repeated node as a cycle fails the diamond. An algorithm that returns on any previously seen node can miss a back edge if it checks completion incorrectly. Both mutations show why the two sets have different meanings.

## FF-08C: reject invalid configuration at an explicit boundary

Hint: collect issues; do not assume the validator throws at the first one.

Missing targets, missing dependencies, self-reference, and duplicate targets each have named issue codes. Self-dependency is handled explicitly and excluded from the graph's self edges. Duplicate targets are invalid even though Map construction and find evaluation have deterministic local behaviors for them; those behaviors are not a supported reconciliation policy for invalid configuration.

Award four points for valid discriminating fixtures and two for the integration proposal. The proposal should identify its caller, how issues reach the learner or editor, and whether a draft may retain invalid unfinished rules while publication rejects them. Source inspection of rules.ts alone does not establish that the current publish endpoint already invokes this validator.

The six exercises add one hundred twenty possible points to the opening assessment. Use them to test transfer: can you apply identity and evidence-boundary reasoning to pure reducers and graphs, rather than only to repositories? Return to [the route](README.md) when you can explain the smallest counterexample to each plausible wrong implementation.
