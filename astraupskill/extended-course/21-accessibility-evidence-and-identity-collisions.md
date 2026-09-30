# 21. Accessibility evidence and identity collisions

FormForge includes accessible naming patterns, linked validation errors, keyboard reordering, and an automated smoke audit. Those are useful building blocks, but each supports a bounded claim. This chapter examines the actual renderer, builder, and [accessibility test](../../apps/web/src/accessibility.test.tsx), then develops a review plan that includes identity and interaction. Read [FormRenderer.tsx](../../apps/web/src/FormRenderer.tsx) and [FormBuilder.tsx](../../apps/web/src/FormBuilder.tsx) alongside the chapter. Answers are in the [separate review](review-08-renderer-and-builder-contracts.md).

## Follow a label and description

For most answer-bearing fields, the renderer emits a label whose htmlFor equals the field ID and a control with that ID. A description creates a hint element with an ID derived by adding a hint suffix. An error similarly creates an error element, and the control's aria-describedby combines the applicable hint and error IDs. The error summary links to the control's ID. These relationships form an identity graph in the DOM.

The checkbox uses a wrapping label containing the input and consentLabel text rather than the same external field-label path. Its description and error references still use the common control properties. A content field renders a heading and body without an answer control. A review should inspect each variant instead of assuming that one text input proves every field kind has the same naming structure.

The graph depends on unique IDs. If two fields share an ID, labels, descriptions, error links, React keys, and answer keys can collide. Core schema validation detects duplicate field IDs, but the renderer itself does not call a schema publication gate before producing DOM. A caller that supplies an invalid schema can therefore create ambiguous relationships. This is one reason validation belongs at ingestion and publication boundaries, not only beside the Publish button.

## Multiple valid forms can still collide

Even two individually valid schemas can contain common field IDs such as name or email. If both renderers appear on the same page without an instance prefix, their control IDs and derived hint/error IDs can collide across forms. The form title ID uses schema.id, but field IDs are not automatically namespaced by that schema ID in the current renderer. This is a source-level risk for a multi-renderer page, not a claim that every current route renders duplicate forms.

A proposed DOM identity layer could prefix control and descriptive IDs with a stable renderer instance identifier while leaving the logical field name used for answer collection unchanged. That distinction is important: changing the DOM ID need not change the schema field ID or submitted key. The label, hint, error, and summary link must all use the same generated DOM identity, or the fix will break one relationship while correcting another.

Do not generate a new random prefix on every render. Stable relationships and focus targets need a stable instance identity over the relevant component lifetime. A framework-supported ID mechanism or an explicit caller prefix can be considered, but the design must account for server rendering and hydration if those become part of the deployment. This course does not claim the current app uses server rendering; it asks the proposal to state its assumptions.

## What the automated smoke audit checks

The accessibility test renders representative renderer, response explorer, and analytics surfaces together, runs axe-core on the container, and expects no detected violations. It explicitly disables the color-contrast rule. The result, when run successfully, is therefore a bounded automated scan of that fixture with that rule configuration. It is not a universal accessibility certification or evidence about color contrast.

The test also does not exercise every interactive state. A static initial fixture can miss error summaries after submission, focus movement after reorder, disclosure state after movement, or conditional controls appearing and disappearing. Separate focused tests cover some of those behaviors, but their assertions still define their scope. A label in a test name cannot expand what the code actually observes.

For a review report, name the exact test or procedure and the state it covers. A sentence such as automated initial-state audit with color contrast excluded is more useful than accessibility passed. It tells the next reviewer what remains to inspect and prevents a future visual change from inheriting confidence it has not earned.

## Keyboard reordering and focus ownership

The builder offers Up and Down buttons in addition to drag-and-drop. Moving a field schedules focus restoration by searching document-wide for buttons with the matching data-field-select value. The focused tests verify that moving Work email up changes order, announces the result, disables the upper move button at the boundary, and eventually focuses the field's edit button.

This is meaningful evidence for the tested single-builder fixture. The document-wide query introduces a possible multi-builder identity issue: another builder with the same logical field ID could provide the first matching button. A proposed fix could scope the query to the builder container or use refs keyed by field identity. The source-level possibility should be characterized with two builder instances before making a runtime failure claim.

The deferred focus operation also has a lifetime. A field could be removed or the builder unmounted before the timeout runs. The optional focus call avoids throwing when no target is found, but it does not establish that the intended focus destination always exists. A richer focus policy could fall back to an adjacent field or an Add control after deletion. That is a separate product decision from reorder focus restoration.

## Announcements and human evidence

The builder places statusMessage in a polite live region and uses specific move text. The test can assert that this text is present. It does not prove exactly how every screen reader announces it, whether repeated identical messages are announced, or whether the timing is comfortable during rapid reordering. Those questions need a targeted manual procedure or environment-specific assistive-technology evidence.

Likewise, an error summary with role alert can expose errors, but the renderer does not explicitly move focus to the summary on failed submit. Whether focus should move, remain on submit, or move to the first invalid control is a UX decision requiring testing with users and assistive technologies. A source review can identify the absence of explicit focus management without declaring one universal required behavior.

For a practical review, define three journeys: submit an empty form and navigate to an error; reorder a field using only the keyboard; and reveal a conditional required field, then hide it after an error. Record focus location, accessible names, visible feedback, and the relation between current errors and visible controls. Include a zoom or narrow-layout review separately because structural DOM checks do not establish usable layout.

## Exercises

**FF-21A, eight points:** Draw the DOM identity graph for a text field with hint and error, then for a checkbox. Explain duplicate-ID failures within one schema and across two otherwise valid renderer instances. Propose a DOM-only namespace that preserves logical answer keys.

**FF-21B, six points:** State the exact scope of the automated accessibility smoke audit, including the disabled rule. Add three interactive states it does not establish by itself and identify suitable focused or manual evidence for each.

**FF-21C, six points:** Review the builder's deferred focus restoration with two instances and with removal before the timeout. Propose a scoped ownership strategy and an announcement test plan without claiming universal screen-reader behavior from DOM assertions.

## Exit evidence

A strong accessibility review connects semantics, identity, interaction, and evidence. It avoids both dismissing automated checks and exaggerating them. The useful question is not whether a page has an accessibility feature, but whether the feature's relationships remain correct across the actual states and component lifetimes that users encounter.
