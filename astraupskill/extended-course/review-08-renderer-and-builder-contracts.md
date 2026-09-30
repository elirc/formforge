# Review 08. Renderer and builder contracts

This review covers chapters 19 through 22. The source has several intentional minimal behaviors and several useful characterization opportunities. Grade precise traces rather than treating every limitation as a proven production incident. Proposed visibility, reset, accessibility, and allocation policies must remain clearly separate from current implementation.

## FF-19A: hidden consent

Selecting engineering updates answers and reveals consent. Checking consent stores true. Selecting design updates role and hides the control without removing the retained consent answer from state. On submit, FormData has no consent control; the full-schema collection loop writes false for that checkbox. Validation uses visibleFields, so hidden consent is not required. The final spread gives submittedAnswers precedence, replacing the retained true with false in the callback object.

In a hide/reveal sequence before submission, the retained true can seed defaultChecked when the control mounts again. Award two points for state retention, two for FormData collection, two for visible-only validation, and two for the different reveal behavior. The answer must distinguish values retained for editing from values serialized while hidden.

## FF-19B: payload table

A visible required text field renders and is validated; its collected string enters the callback. A hidden required text field does not render and is not validated, but its schema entry receives an empty string from missing FormData. A visible unchecked checkbox contributes false. A hidden previously checked checkbox also contributes false at submission despite retained state. Content fields are skipped by the collection loop. An unknown initial answer key can survive the answers spread because no schema-collected entry overwrites it.

Award four points for the six cases and two for identifying the merge and evidence scope. A success message establishes that visible-schema validation returned no errors in that submission. It does not establish an intended omission policy, absence of extra keys, or compatibility with the server's final submission contract.

## FF-19C: shared visibility policy

A coherent proposal publishes rules with a schema version and validates the rule graph before publication. The server recomputes field eligibility from the submitted answers under that published contract. It then applies the chosen hidden-answer policy: omit, retain, or normalize, with consequences documented for analytics and backtracking. A caller-supplied visible-field list is not authoritative because it can bypass required checks.

Award two points for versioned rule/schema alignment, two for a clear hidden-answer representation, and two for server authority. The current API and renderer do not automatically share this complete pipeline. The design is valuable precisely because it names the integration work still needed.

## FF-20A: mount and reset boundaries

Changing initialAnswers on a mounted renderer does not rerun the useState initializer. Uncontrolled controls are seeded by default values rather than continuously driven by value props. A whole-form remount creates a new local state and controls, potentially discarding an unsaved draft. A conditional-field remount occurs within the existing renderer and can use its retained answers state.

Award three points for distinguishing the lifetimes, three for tracking the user's draft, and two for an explicit reset or merge proposal. Do not assume that remounting is always desirable. It is a deliberate ownership decision that may be appropriate for a new page or record and destructive for an active draft.

## FF-20B: feedback timing

An invalid submit sets errors and submitted false. Editing updates answers without clearing or recomputing errors. A later valid submit replaces errors with an empty object and sets submitted true. Further editing does not explicitly reset submitted, so the success message can remain as a report of the last successful validation rather than current validity.

If a field with an error becomes hidden before resubmission, the errors object can remain nonempty while the summary list filters to visible fields. A focused test should perform that sequence and inspect summary presence and links. Award three points for the validation timeline, two for the hidden-error schedule, and one for suitable assertions. A test that only submits an already hidden field does not cover this stale-error path.

## FF-20C: layered validation

A proposal can validate on submit, on blur, or after first submission on change, but it must define when success becomes stale and when errors disappear. The noValidate form delegates submission feedback to application logic rather than native constraint-validation UI. Input types and bounds still contribute control behavior and semantics. Core validation defines application checks, and server validation remains the authoritative boundary for untrusted callers.

Award two points for timing policy, two for meaningful success semantics, and two for the layered distinction. Required stars without required or aria-required props are a specific programmatic-state review point in this source. The answer should propose and verify communication of required state rather than claiming the visual marker alone covers every user.

## FF-21A: DOM identity graph

The text-field graph connects label to control ID, hint and error IDs to aria-describedby, and summary link to the control ID. The checkbox uses a wrapping label with consent text while retaining description/error references. Duplicate logical IDs can collide within one renderer. Two valid schemas can also reuse field IDs across renderer instances because the current control IDs are not automatically namespaced by form instance.

A proposed instance prefix can change DOM IDs while preserving field names and logical answer keys. Every relationship must use the same stable generated ID. Award three points for the graphs, three for the two collision scopes, and two for a stable DOM-only namespace. Randomizing IDs on every render undermines the relationships the proposal is meant to protect.

## FF-21B: automated audit scope

The smoke test scans a representative combined fixture and explicitly disables color-contrast checking. It does not certify all interactive states or all accessibility properties. Error submission, keyboard reorder focus, conditional reveal/hide, and narrow-layout use need additional focused or manual evidence. The existing builder tests cover selected order, focus, and disclosure behavior in their fixtures.

Award two points for the exact smoke scope, two for three additional states, and two for matching evidence to those states. A passing DOM role assertion cannot establish every screen reader's announcement timing. A useful report names the tested state and excluded rules so future reviewers know what confidence they can reuse.

## FF-21C: focus ownership

The deferred focus helper searches the entire document for a matching field data attribute. With two builders sharing a field ID, the first match can belong to the wrong instance. If the intended field disappears before the callback, the optional focus call avoids an exception but does not provide a fallback destination. These are schedules to characterize, not universal failures in the single-builder tests.

A scoped container query or owned ref map can tie focus to the correct builder. The proposal should define fallback after removal and verify live-region text separately from assistive-technology announcement behavior. Award two points for each schedule, one for scoped ownership, and one for honest announcement evidence.

## FF-22A: allocation counterexample

With two initial fields including text-3, the sequence begins at two. Adding text increments it to three and supplies text-3, colliding with the existing field. The reducer appends the supplied field; later schema validation can flag the duplicate but does not prevent its construction. Not decrementing the ref after deletion avoids one simple reuse pattern within a mounted session, but does not establish uniqueness for arbitrary inputs.

A local allocator can check a candidate against current IDs and advance until unused. Concurrent authors need a policy with cross-author uniqueness or authoritative allocation. Award four points for the exact counterexample, two for the local policy, and two for the collaborative distinction. Labels and array indices are unsuitable substitutes for stable logical identity because both can change independently of the field's meaning.

## FF-22B: observation timing

Two sends from one render closure can compute reducer(S, A) and reducer(S, B) for callbacks while queued component state becomes reducer(reducer(S, A), B). The discrepancy is in the prediction/notification layer, not necessarily the pure reducer. A characterization harness must actually invoke multiple actions before a new render supplies a fresh closure.

The proposed callback contract should name whether it reports attempted actions, predicted state, or committed schema observations. An effect-based notification changes timing and may need an initial-notification policy; it is not a free semantic replacement. Award three points for the trace, two for a precise contract, and one for the relevant adverse schedule. Ordinary separate clicks alone do not establish the stale-closure case.

## FF-22C: action and persistence categories

Selection changes UI selection without necessarily changing schema. A no-op move can preserve schema identity. A real reorder changes schema field order. A label edit changes schema content. Details disclosure belongs to row-local component state. Consumers should not assume every callback or UI action requires a draft save. The current Publish button only sets a readiness message after local schema checks; it does not call the publication API.

Award three points for the action classification and three for the actual publication scope and missing integration boundaries. A production publication action must coordinate current schema, workspace authorization, route identity, slug ownership, server validation, and in-flight schema changes. Local button readiness is useful feedback, not an authoritative publication receipt.

## Independent review conference

Choose one field and follow it through three identities: its logical schema ID, its DOM control ID, and its React component key. Explain which changes preserve each identity and which require a reset or migration. Then follow one answer through React state, FormData collection, and server submission. If those traces remain distinct and coherent, you understand the renderer and builder more deeply than a checklist of supported field types can demonstrate.
