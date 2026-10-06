# Why FormForge has tests

This repository adds tests to help a junior software engineer learn how professional teams make changes safely. Tests are not points, screenshots of implementation, or a substitute for thinking. Each test is an executable claim about a user-visible behavior or a boundary the product must protect.

## What the layers teach

- Core tests make domain rules fast to understand: schema variants, branching, cycles, pagination, diffs, and metric denominators.
- Component tests use labels and roles because users interact with controls, focus, messages, and navigation—not React internals.
- API tests prove runtime validation, authorization, status codes, immutable publication, and retry safety.
- Property tests generate many values to challenge invariants such as CSV quoting and probability bounds.
- Accessibility checks catch detectable semantic problems, and keyboard component tests cover interaction. Layout and real assistive-technology behaviour still need a real browser — v1.0.0 has no browser automation, and the release audit says so (`docs/audits/sprint-15-release.md`).

## The most important habit: red, then green

Sprint 14 includes five examples. Each regression test was committed while failing for the intended reason, followed by the smallest model-level repair:

1. Lost reorder focus → explicit focus restoration.
2. Disclosure state moved to another row → stable field-ID keys.
3. Autosaves raced with stale versions → serialized version-aware writes.
4. A three-field rule cycle passed validation → depth-first graph traversal.
5. A failed comment stayed pending → rollback by temporary ID with retry text preserved.

This ordering proves the test can detect the bug. A test written only after a fix may pass even if it never exercises the failure.

The main branch only shows one squashed commit per sprint. To see the five red/green pairs, list the Sprint 14 pull request's commits: `gh pr view 70 --repo elirc/formforge --json commits -q '.commits[].messageHeadline'` — the first ten alternate `test(sprint-14): expose … (red)` and `fix(sprint-14): … (green)`.

## How to add a good test

1. Name the risk in plain language.
2. Arrange the smallest meaningful state.
3. Act through a public function, HTTP boundary, or accessible control.
4. Assert the outcome a caller or user can observe.
5. Make it fail for the expected reason, implement the repair, then run `pnpm gate`.

Control clocks, promises, IDs, and repositories when they are part of the behavior. Avoid sleeps, private-state assertions, broad snapshots, and mocks that repeat the implementation. See [TESTING.md](TESTING.md) for commands and the full layered strategy.

## Exercises

Each rung has a goal and a **Check** you can confirm yourself. Rungs 1–3 are reading only; rungs 4–6 need `pnpm install` and Node 22.

1. **Map each flaw to its guard.** Goal: for each row of `docs/sprints/flaw-ledger.md`, find the test that now pins it.
   **Check:** focus → `FormBuilder.test.tsx` "keeps keyboard focus with the field that was moved"; row identity → "keeps row-local disclosure state attached to field identity" (same file); autosave → `useAutosave.test.tsx` "serializes overlapping edits so the next save uses the committed version"; cycle → `packages/core/src/rules.test.ts` "rejects a dependency cycle spanning multiple fields"; comment → `CollaborationPanel.test.tsx` "rolls back a rejected optimistic comment while preserving retry text".
2. **Explain why pairwise checks missed the cycle.** Goal: read `validateVisibilityRules` in `packages/core/src/rules.ts`. The first loop only rejects `dependency === rule.targetFieldId`; the `visit` function below it walks the graph with a `visiting` set and a `path`.
   **Check:** you can trace `name → email → role → name` through `visit` and say which line marks all three fields `dependency.cycle`, and why the self-dependency check alone could never see it.
3. **Find a gap in the CSV guard.** Goal: read `escapeCsvCell` in `packages/core/src/responses.ts` and its test "escapes CSV delimiters, quotes, line breaks, and formula prefixes".
   **Check:** you can name an input the formula guard `/^[=+\-@]/` lets through unprefixed — for example a value starting with a tab character followed by `=` — and explain why spreadsheet-injection guidance (e.g. OWASP's CSV Injection page) also lists tab and carriage return as dangerous leading characters.
4. **Reproduce a red commit.** Goal: in `apps/web/src/useAutosave.tsx`, temporarily replace the chained `queue.current = queue.current.then(async () => { … })` with an immediately invoked `(async () => { … })()` so two saves can overlap, then run `pnpm --filter @formforge/web test`.
   **Check:** "serializes overlapping edits…" fails at `expect(save).toHaveBeenCalledTimes(1)` — the second save started with stale version `0` before the first committed. `git checkout -- apps/web/src/useAutosave.tsx` restores green.
5. **Write the red test for rung 3.** Goal: add a case to `responses.test.ts` asserting that `escapeCsvCell("\t=1+1")` is neutralised.
   **Check:** it fails against the current guard (red). Extend the regex to cover `\t` and `\r`, re-run `pnpm --filter @formforge/core test`, and it passes (green) — the same red-then-green habit Sprint 14 models. Core's count goes from 34 to 35.
6. **Run the whole gate.** Goal: `pnpm gate`.
   **Check:** lint, typecheck, all 77 tests (78 after rung 5), the build, and the bundle budget line (`Bundle budget: JS … / 450 KiB; CSS … / 30 KiB.`) all pass.
