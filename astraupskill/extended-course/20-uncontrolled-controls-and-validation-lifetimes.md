# 20. Uncontrolled controls and validation lifetimes

The renderer combines React state for rule evaluation with uncontrolled form inputs initialized through defaultValue or defaultChecked. This hybrid can be practical, but it requires careful reasoning about mount identity, prop changes, and validation timing. Read [FormRenderer.tsx](../../apps/web/src/FormRenderer.tsx) and its [focused tests](../../apps/web/src/FormRenderer.test.tsx). Use the [separate review](review-08-renderer-and-builder-contracts.md) after your predictions.

## What initial means

The answers state uses initialAnswers as the initial useState value. The source does not contain an effect that resets answers when that prop changes. Input controls use default values rather than controlled value/checked props. Therefore, a caller should not assume that changing initialAnswers on an existing mounted renderer synchronizes every current control and internal answer with the new object.

This is a lifecycle contract rather than a statement that the component is always wrong. Initial values often intentionally seed a form once, allowing the user to edit without having parent rerenders overwrite their work. If the caller wants a new form session, a deliberate remount or explicit reset mechanism can be appropriate. If it wants to merge remote changes into an active form, that requires a different policy with conflict handling.

The multi-page component keys its renderer by current page, creating a mount boundary on page changes. That can reset local errors and submitted state for the new page while seeding answers from the session. The builder preview, by contrast, renders a renderer in place as its schema changes. These call sites have different lifecycle needs even though they use the same component.

## Trace a prop update

Imagine a renderer mounted with name Ada. The user changes the input to Grace. The form-level change handler stores Grace in answers. A parent then passes a new initialAnswers object containing Lin without changing the component identity. The useState initializer does not run again merely because the prop changed. The source contains no explicit reset action, so treating Lin as an authoritative replacement would require behavior not shown here.

Now remount the renderer with a new key and the Lin initial value. A fresh state and fresh uncontrolled controls are created. The user's previous Grace draft is discarded unless the parent preserved it elsewhere. This demonstrates why remounting is a powerful but potentially destructive reset mechanism. A future API should name reset intent instead of relying on incidental key changes that callers may not understand.

For a conditional field that disappears and reappears, the control itself can remount while the renderer remains mounted. Its default value comes from the retained answers state. That is a different reset scope: field DOM lifetime changes, but the form's answers object remains. A test plan should distinguish whole-form remount, field visibility remount, and ordinary parent rerender.

## Errors are submission results

The change handler updates answers but does not clear or recompute errors. Errors are replaced when submit runs validation. After a failed submit, correcting a value can leave the displayed error until another submit. This is a current validation timing policy, whether intentional or simply minimal. It should not be described as live validation merely because visibility reacts live to answers.

The submitted success flag also changes only during submission. A valid submit sets it true. Later editing does not explicitly reset it, so the success status can remain while the user changes the form into an invalid state. The sentence Preview response is valid then reflects the last validation result rather than a continuously recomputed guarantee about the current draft.

A proposed UX can choose submit-only validation, blur validation, or change validation after first submission. Each choice needs a contract for error persistence and success messaging. Constant validation can create noisy feedback while a user is still typing. Submit-only validation can preserve stale messages. The solution is not automatically validate everything all the time; it is to align feedback timing with the user journey and make the status meaningful.

## Hidden errors and summary state

The error summary's outer condition checks whether the errors object has any keys. Its list, however, includes only visible fields with corresponding errors. If a field produced an error and later becomes hidden without a new submit, the errors object can still contain that entry while the visible summary list omits it. The result can be a summary container whose current visible entries do not explain every stored error.

This is a precise source-level schedule to characterize, not a claim that every conditional form displays an empty summary. It requires an earlier validation failure and a later visibility change without resubmission. A focused test should create that sequence and inspect both summary presence and visible links. A test that mounts an already hidden field and submits once covers a different path.

A proposed error policy can prune errors when fields become ineligible, recompute errors for visible fields, or display a summary based only on current visible errors. Each policy should preserve useful feedback without making hidden fields block progress. Coordinate it with the final payload policy from the previous chapter so validation, summary, and serialization do not evolve independently.

## Browser constraints and application validation

Controls include type, min, max, and maxLength attributes where appropriate, but the form uses noValidate. The application therefore handles submission validation through the core validator rather than relying on the browser's native validation UI. Attributes can still affect control behavior and semantics; noValidate does not mean every browser behavior disappears. It means learners should not assume a native constraint-validation popup is the authority for submission in this component.

The core validator's rules and the control attributes are not identical by definition. A number control can restrict ordinary UI input while an API caller sends a different typed value. A date control can offer a calendar while the server receives strings. A complete contract needs runtime validation at the authoritative boundary, not only appropriate input types in the browser. Earlier chapters identified core validation edge cases that remain relevant here.

Required visual stars are rendered for most non-checkbox labels, but the common control props shown in the source do not include required or aria-required. This is a concrete accessibility review point, not proof of a universal failure across every assistive technology. A proposed enhancement should decide how required state is communicated programmatically while retaining custom validation behavior.

## Exercises

**FF-20A, eight points:** Compare ordinary rerender with changed initialAnswers, whole-form remount, and conditional-field remount. Track the user draft and explain which reset semantics are explicit in source and which require a new component API.

**FF-20B, six points:** Trace invalid submit, correction without submit, valid submit, and later invalid edit. Predict errors and success status. Add the hidden-error schedule and state the focused assertions needed to characterize it.

**FF-20C, six points:** Propose a validation timing policy with clear success-message semantics. Explain how noValidate, control attributes, core validation, and server validation each contribute without treating one as a substitute for the others.

## Transfer task

Apply the same lifetime analysis to an edit dialog that receives a new record while open. Decide whether to preserve the user's draft, reset it, or ask for a merge. The key lesson is that initial values, current values, and authoritative remote values have different owners. A component can only handle them reliably when its API and mount behavior make those ownership decisions explicit.
