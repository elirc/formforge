# Why FormForge has tests

This repository adds tests to help a junior software engineer learn how professional teams make changes safely. Tests are not points, screenshots of implementation, or a substitute for thinking. Each test is an executable claim about a user-visible behavior or a boundary the product must protect.

## What the layers teach

- Core tests make domain rules fast to understand: schema variants, branching, cycles, pagination, diffs, and metric denominators.
- Component tests use labels and roles because users interact with controls, focus, messages, and navigation—not React internals.
- API tests prove runtime validation, authorization, status codes, immutable publication, and retry safety.
- Property tests generate many values to challenge invariants such as CSV quoting and probability bounds.
- Accessibility checks catch detectable semantic problems, while keyboard and real-browser checks cover interaction and layout.

## The most important habit: red, then green

Sprint 14 includes five examples. Each regression test was committed while failing for the intended reason, followed by the smallest model-level repair:

1. Lost reorder focus → explicit focus restoration.
2. Disclosure state moved to another row → stable field-ID keys.
3. Autosaves raced with stale versions → serialized version-aware writes.
4. A three-field rule cycle passed validation → depth-first graph traversal.
5. A failed comment stayed pending → rollback by temporary ID with retry text preserved.

This ordering proves the test can detect the bug. A test written only after a fix may pass even if it never exercises the failure.

## How to add a good test

1. Name the risk in plain language.
2. Arrange the smallest meaningful state.
3. Act through a public function, HTTP boundary, or accessible control.
4. Assert the outcome a caller or user can observe.
5. Make it fail for the expected reason, implement the repair, then run `pnpm gate`.

Control clocks, promises, IDs, and repositories when they are part of the behavior. Avoid sleeps, private-state assertions, broad snapshots, and mocks that repeat the implementation. See [TESTING.md](TESTING.md) for commands and the full layered strategy.
