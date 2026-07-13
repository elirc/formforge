# Sprint 08: Conditional logic

## Outcome

FormForge can model nested conditional rules, validate authoring references, and show or hide fields from live respondent answers. Required hidden fields are excluded from response validation.

## Evidence

- Core examples cover nested truth tables, generated equality values, visibility defaults, and invalid references.
- React tests exercise both directions of a live visibility change.
- A submission test proves that hidden required fields do not block a valid response.

## Review prompts

- Why is the expression structure a tree while field dependencies are a graph?
- What should happen to an answer when its field becomes hidden?
- Which graph failures are impossible to catch with a direct self-reference check?
