# Contributing to FormForge

FormForge is both a product repository and a review-driven curriculum. The history should teach as clearly as the final code.

## Sprint workflow

1. Open the sprint milestone and its four stakeholder issues.
2. Create a branch named `sprint-NN-short-description` from the latest `main`.
3. Add commits in an intentional learning order: domain, UI, integration, evidence, then documentation when practical.
4. Open a draft pull request early and connect all four issues.
5. Add inline review comments that explain decisions, risks, and alternatives at the relevant lines.
6. Record one author/reviewer question-and-response exchange and one substantive design debate.
7. Run focused checks while iterating and the complete gate before review.
8. Mark the pull request ready only after the learner-facing documentation and evidence are present.
9. Merge sequentially, close the milestone, and begin the next sprint from the new `main`.

## Definition of done

A sprint is complete only when:

- its user-visible outcome works through the intended interface;
- TypeScript passes in strict mode without weakening compiler settings;
- loading, empty, error, success, and permission states are deliberate;
- new domain rules and risky boundaries have behavior-focused tests;
- keyboard and screen-reader behavior has been considered for interactive UI;
- an ADR records the main architecture choice;
- a concept note teaches the sprint's core React or TypeScript idea;
- review discussion captures a real tradeoff rather than staged agreement;
- CI passes and the milestone's issues are closed by the merged pull request.

## Commit guidance

Keep commits reviewable and runnable. Each commit message should include:

- a terse subject describing the outcome;
- `Why this way:` explaining the design choice;
- `Notice:` pointing the learner toward an important detail;
- `See also:` linking the sprint ADR, concept note, or test when relevant.

Do not mix unrelated cleanup into a sprint commit. A learner should be able to inspect the history and see the product and reasoning develop together.

## Testing guidance

Choose tests from risk, not from a desired coverage number. Prefer observable behavior over private implementation details. Use the smallest layer that proves the claim accurately, then add boundary or end-to-end evidence when integration is the risk.

Every defect fix begins with a reproducing test or another explicit failing check. See the Sprint 1 testing guide when it is added for commands and repository-specific examples.
