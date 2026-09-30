# 19. Renderer visibility and submission shape

Conditional fields create two related but different questions: which controls are visible, and which values are submitted. The current [FormRenderer](../../apps/web/src/FormRenderer.tsx) answers them through different paths. This chapter traces those paths precisely so a future integration does not assume that hidden fields disappear from the payload. Attempt the exercises before the [renderer and builder review](review-08-renderer-and-builder-contracts.md).

## Two sources of answers

The renderer initializes an answers state object from initialAnswers. Its form-level change handler reads the event target's name and stores either checkbox checked state or the control's string value. Visibility is computed by filtering schema fields through `isFieldVisible` using that answers object. This makes visibility respond to ordinary control changes without waiting for submission.

On submit, however, the component constructs FormData from the actual form element. It then loops over all schema fields, skipping content fields. For a checkbox it records whether FormData has that field name. For every other answer-bearing field it records the retrieved value converted to a string, with missing data becoming an empty string. It validates a schema containing only currently visible fields, then calls the callback with the answers state merged with those newly collected submitted answers.

The ordering of that merge matters. Newly collected entries overwrite corresponding answers state entries. Because the loop includes hidden schema fields, a hidden non-checkbox receives an empty string when no control exists, and a hidden checkbox receives false. The current callback payload is therefore not simply the set of visible controls, nor is it a complete preservation of every hidden historical answer.

## Work a hidden checkbox trace

Start with a role choice that reveals a consent checkbox when engineering is selected. The learner selects engineering and checks consent. The change handler stores role and consent in answers, and the checkbox is visible. Next the learner changes the role to design. Visibility removes consent from the rendered form, but the answers state still retains the earlier true value because changing role did not delete it.

At submission, FormData has no consent control. The loop still visits the consent field in the full schema and records false. Validation uses visibleFields, so hidden consent is not required for this submission. The callback merge overwrites the retained true answer with false. This is the actual combination of visibility, collection, and merge behavior; describing it as hidden answers are always preserved would be incorrect.

Now hide and reveal the checkbox before submitting. The answers state still holds true during the hidden period, and remounting the checkbox uses defaultChecked based on that state. It can reappear checked. Thus the same hidden field can retain its value for a later reveal yet be represented differently in a submission made while hidden. These are not contradictory observations once the two collection paths are distinguished.

## Validation scope is a policy

The component intentionally validates only visible fields. The existing [renderer tests](../../apps/web/src/FormRenderer.test.tsx) verify that a required field is not validated while its rule hides it. This is a useful respondent experience, but it is not automatically the server's policy. The API validates submitted answers against a publication schema and does not receive this renderer's visibleFields array as an authoritative validation decision.

A future integrated product must choose how visibility rules participate in server validation. One option is to publish a versioned schema together with its rules and recompute visibility from submitted answers at the server. Another is to forbid conditional requirements unless the server understands the same rule model. Trusting a client-supplied list of visible fields would let a caller bypass required checks by hiding fields in the payload, so it is not an adequate authority boundary.

Rules also need validation before evaluation. Missing dependencies, duplicate targets, and cycles have separate implications in the core rule model. The renderer accepts rules and evaluates them; it does not itself establish that the whole rule graph has passed a publication gate. A complete publication pipeline would coordinate schema validation and rule validation under one versioned contract. Mark that pipeline as a proposal until the application actually wires it.

## Unknown and removed answer keys

The callback begins with the existing answers object and overlays submitted schema entries. Keys present in initialAnswers or accumulated state that are no longer represented in the current schema can remain in the merged object. This is a source-level consequence of the spread operation, not a guarantee that all callers supply such keys. A controlled characterization test can provide an extra initial key and inspect the callback result.

Whether those keys should be retained is a domain decision. A multi-page flow may intentionally keep answers from other pages, while a final public submission may want only fields from the published schema. The renderer is reused in contexts with different needs, so a payload policy should belong to an explicit boundary rather than an accidental merge. A proposed collector can distinguish current-page answers, full-session answers, and final submission answers.

Similarly, removing a field from a builder preview does not automatically clear every historical answer state associated with its ID. If the same ID is later reused for a different meaning, retained state can become misleading. Stable field identity should represent a stable logical field, and schema evolution needs a policy for removed or replaced fields. Merely ensuring a DOM element has an ID does not solve data lifecycle semantics.

## A payload characterization laboratory

Create a table with visible required text, hidden required text, visible unchecked checkbox, hidden previously checked checkbox, content field, and an unknown initial answer key. Predict three outputs for each: whether a control is rendered, whether validation examines it, and what the callback payload contains after a valid submit. This table is more useful than a single pass/fail assertion because it separates the three contracts.

Use a callback spy in a future isolated component test to inspect the exact submitted object. A test that only sees the success status cannot establish payload shape. Conversely, a pure collector model can make the merge logic explicit but does not prove FormData behavior in the browser or React's mount behavior. Label the evidence level and do not run broad application suites merely to make a source-reading claim sound stronger.

For a proposed refactor, choose a hidden-answer policy explicitly: omit, retain, or normalize to empty. Each has consequences for analytics, rule evaluation, and server validation. Omission can distinguish not applicable from answered empty, but the data model must preserve that distinction. Retention can support backtracking but may expose stale or irrelevant values in a final response. Normalization simplifies some consumers while losing history. There is no universal answer independent of the product contract.

## Exercises

**FF-19A, eight points:** Trace consent through reveal, check, hide, submit, and a separate hide/reveal sequence. Show answers state, FormData presence, validation scope, and callback value at each relevant point.

**FF-19B, six points:** Complete the six-row payload characterization table. Identify the exact merge that can retain unknown answer keys and explain why a visible success message does not prove the callback object has the intended shape.

**FF-19C, six points:** Propose a versioned visibility and submission policy shared by client and server. Choose how hidden answers are represented and explain how the server recomputes eligibility without trusting a client-supplied visible-field list.

## Exit standard

A strong answer distinguishes rendering, validation, and serialization. It uses the same field through a changing timeline rather than treating hidden as a permanent property. That discipline prevents a common integration error: assuming that a component's successful preview validation establishes the exact final payload and authority rules of a production submission endpoint.
