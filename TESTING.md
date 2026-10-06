# Testing FormForge

Tests in FormForge are executable claims about product behavior. Choose them from risk rather than a coverage target.

## Layers

- **Pure domain tests** protect schema, validation, transitions, reports, and ordering without a browser.
- **Component tests** exercise what a user can see, click, type, and navigate with accessible queries.
- **API tests** inject requests at the transport boundary and assert validation, permissions, and idempotency.
- **Property tests** generate schema, rule, ordering, and CSV inputs to check invariants broadly.
- **Accessibility checks** run `axe-core` against rendered compositions in jsdom (`apps/web/src/accessibility.test.tsx`), with colour contrast excluded because jsdom has no layout engine. There are **no end-to-end browser tests** yet: the Sprint 15 browser sweep is recorded as an evidence exception in `docs/audits/sprint-15-release.md`, and "browser automation for publish → respond → analyze" is listed as a next exercise in `docs/COURSE-RETROSPECTIVE.md`.

## What exists today

77 Vitest cases at v1.0.0 (static count, 2026-10-06):

| Package | Cases | Files |
| --- | --- | --- |
| `packages/core` | 34 | 9 (`validation.test.ts` has one `it.each` with 4 rows) |
| `packages/data` | 9 | 4 |
| `apps/web` | 27 | 12 |
| `apps/api` | 7 | 1 (`app.test.ts`, via Fastify `inject`) |

Property tests use `fast-check` (4 `fc.assert` calls in core: schema round trip, rule equality, CSV quoting, completion-rate bounds). To recount, list `it(` lines in `*.test.ts*` files and expand each `it.each` table by its row count.

## Workflow

1. State the behavior and the risk in one sentence.
2. Make the smallest test fail for the intended reason.
3. Implement the smallest behavior that makes it pass.
4. Refactor while the evidence remains green.
5. Run the focused package test, then `pnpm gate` before review.

## Commands

```bash
pnpm test
pnpm --filter @formforge/web test
pnpm --filter @formforge/core test
pnpm gate
```

Strong tests observe public outcomes, control time and identity, avoid test-order dependencies, and fail with a name that explains the broken contract. Avoid private-helper assertions, indiscriminate snapshots, sleeps, and mocks that merely repeat the implementation.
