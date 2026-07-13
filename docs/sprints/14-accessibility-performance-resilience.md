# Sprint 14: Accessibility, performance, and resilience

## Outcome

FormForge harvested five planted flaws through red/green commits and added automated accessibility evidence, route splitting, offline and render recovery, and an enforced bundle budget.

## Evidence

- Focus and row-local state remain attached to the moved field.
- Overlapping autosaves serialize and use the committed version.
- Multi-field conditional cycles are rejected by graph traversal.
- Rejected optimistic comments disappear while their text returns to the editor.
- Representative axe checks, recovery component tests, and production size budgets run in the gate.

## Review prompts

- Why is a passing regression test more durable than a code comment describing the bug?
- Which accessibility claims require a real browser rather than jsdom?
- What does a raw bundle budget detect, and what can it not prove?
