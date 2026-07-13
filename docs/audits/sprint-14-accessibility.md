# Sprint 14 accessibility audit

## Automated evidence

`axe-core` 4.12.1 reports zero detectable violations for a representative public form, response explorer, and analytics dashboard composition. Color contrast is disabled in this jsdom audit because computed layout and visual contrast are not reliable without a browser renderer.

## Interaction evidence

- Reordering has named Up and Down buttons in addition to pointer drag.
- Focus returns to the moved field for both button and drop paths.
- Stable field keys keep expanded disclosure state with domain identity.
- Live regions announce reorder, autosave, offline, submission, and mutation outcomes.
- Analytics visual bars are decorative and paired with captioned exact-value tables.

## Remaining browser checks

Sprint 15’s release audit will run the application in the in-app browser at desktop and narrow viewports, follow the public submission and workspace navigation paths, and record any release-blocking findings.
