# Testing FormForge

Tests in FormForge are executable claims about product behavior. Choose them from risk rather than a coverage target.

## Layers

- **Pure domain tests** protect schema, validation, transitions, reports, and ordering without a browser.
- **Component tests** exercise what a user can see, click, type, and navigate with accessible queries.
- **API tests** inject requests at the transport boundary and assert validation, permissions, and idempotency.
- **Property tests** generate schema, rule, ordering, and CSV inputs to check invariants broadly.
- **End-to-end and accessibility checks** cover a few critical browser journeys and interaction contracts.

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
