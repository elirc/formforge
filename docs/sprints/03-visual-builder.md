# Sprint 03: Visual builder basics

## Outcome

Authors can add all field kinds, select and edit field metadata, duplicate fields with new identity, delete fields, and see the preview update from canonical reducer state.

## Evidence

Reducer tests cover add/select, duplicate identity, and removal selection. The component test performs the complete author interaction through accessible controls and observes the rendered email field.

## Review prompts

- Which values are canonical and which are derived?
- Why does the action carry the new ID?
- How would duplicated field objects drift if each panel owned a copy?
