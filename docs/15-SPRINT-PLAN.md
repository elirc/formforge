# FormForge: Fifteen-Sprint Curriculum

This plan takes a junior engineer from a blank repository to ownership of a production-shaped React and TypeScript product. The sequence introduces complexity only after the learner has a model for the layer underneath it.

## Course operating model

Each sprint produces four stakeholder issues, one reviewed pull request, one ADR, one concept note, and focused test evidence. Pull requests merge in order so later lessons build on real earlier decisions. The instructor should ask the learner to predict behavior before revealing a test result or implementation.

Five learning incidents are deliberately reserved for later discovery:

1. unstable list identity that corrupts field-local state;
2. an autosave stale-closure race;
3. cyclic conditional logic that can recurse forever;
4. an optimistic comment that fails to roll back;
5. a drag-only interaction that excludes keyboard users.

Each incident must be harvested with a failing test or audit, a minimal fix, and a retrospective explaining why the earlier review system missed it.

## Sprint 01 — Foundations and app shell

**Outcome:** A deployable React shell with strict TypeScript, repository conventions, CI, design tokens, responsive navigation, and explicit loading/error boundaries.

**Teach:** JSX and component composition, props versus local state, semantic HTML, module boundaries, TypeScript inference, strict compiler settings, and the shape of a useful test pyramid.

**Evidence:** render tests for navigation and boundary states; type-level checks for public component props; production build and accessibility smoke check.

**Decision:** record why the repository uses a client-rendered Vite application and explicit API boundary for this curriculum.

## Sprint 02 — Typed schema and form renderer

**Outcome:** A form schema can represent the initial field types and render a read-only form preview.

**Teach:** discriminated unions, exhaustive switches, `never`, readonly data, recursive rendering, stable public types, and the difference between compile-time and runtime validation.

**Evidence:** one test per field behavior, an exhaustiveness demonstration, malformed-schema boundary tests, and a property test for schema round trips.

**Decision:** choose a normalized or nested schema representation and document its editing tradeoffs.

## Sprint 03 — Visual builder basics

**Outcome:** Authors can add, select, edit, duplicate, and delete fields while the preview updates immediately.

**Teach:** reducer state, action unions, immutable updates, controlled form inputs, lifting state, derived data, and selector hooks.

**Evidence:** reducer transition tests and component tests that assert user-visible editing behavior rather than internal hook calls.

**Decision:** define which builder state is canonical and which values are derived.

## Sprint 04 — Reordering and field library

**Outcome:** Authors can browse a field palette and reorder fields with pointer or keyboard controls while focus remains predictable.

**Teach:** identity versus array position, React keys, refs, focus management, event propagation, drag overlays, and accessible alternatives to pointer gestures.

**Evidence:** reducer ordering properties, keyboard component tests, focus assertions, and a manual screen-reader checklist.

**Planted incident:** allow one subtle unstable-key behavior to survive for a later red/green harvest.

## Sprint 05 — Validation, preview, and first demo

**Outcome:** Authors configure required and field-specific validation, preview responsive forms, and see actionable schema errors before publishing.

**Teach:** validation as data, error maps, form events, touched state, error boundaries, reusable field contracts, and testing negative paths.

**Evidence:** validation truth tables, error-summary accessibility test, preview integration test, and a scripted demo. Publish `v0.5.0`.

**Decision:** separate authoring-time schema validation from respondent-value validation.

## Sprint 06 — Workspaces, routing, and query boundaries

**Outcome:** A user can navigate workspaces, a form dashboard, builder routes, and preview routes with deliberate loading, empty, error, and not-found states.

**Teach:** nested routing, URL parameters, search parameters, server-state ownership, query keys, invalidation, and route-level code organization.

**Evidence:** route integration tests, typed search-parameter tests, and cache-isolation tests between workspaces.

**Decision:** document what belongs in URL, server cache, builder reducer, and component-local state.

## Sprint 07 — Draft persistence and autosave

**Outcome:** Drafts autosave with visible state, retries, version comparison, and a recoverable conflict experience.

**Teach:** effects as synchronization, dependency arrays, custom hooks, debouncing, cancellation, stale closures, optimistic concurrency, and idempotency.

**Evidence:** fake-clock autosave tests, concurrent-save repository tests, conflict UI tests, and a no-unbounded-retry assertion.

**Planted incident:** preserve one realistic stale-closure race for later diagnosis.

## Sprint 08 — Conditional logic

**Outcome:** Authors can express typed show/hide rules and preview them against respondent answers.

**Teach:** recursive unions, type narrowing, interpreters, dependency graphs, cycle detection, memoized selectors, and property-based testing.

**Evidence:** truth-table unit tests, generated rule-tree tests, and malformed/cyclic rule tests.

**Planted incident:** permit a multi-node cycle through an initially incomplete validator, then harvest it with a generated counterexample.

## Sprint 09 — Multi-page forms and branching

**Outcome:** Forms can have pages, branching destinations, progress, back navigation, and resumable response sessions.

**Teach:** state machines, reachable-state analysis, derived progress, reducer composition, browser persistence, migrations, and recovery UI.

**Evidence:** transition-table tests, unreachable-page checks, refresh/resume integration test, and history-navigation E2E test.

**Decision:** choose how schema versions and in-progress responses interact.

## Sprint 10 — Publishing and public submissions

**Outcome:** Authors publish immutable versions; respondents load a public form and submit validated responses with retry safety.

**Teach:** trust boundaries, runtime parsing, immutable snapshots, CSRF and abuse considerations, idempotency, privacy-aware errors, and fake outbound intents.

**Evidence:** public boundary tests, duplicate-submit concurrency test, cross-workspace authorization tests, and a threat-model update.

**Decision:** define what a published version freezes and how later edits behave.

## Sprint 11 — Response explorer

**Outcome:** Authors browse, filter, sort, paginate, select, and export responses from a large accessible table.

**Teach:** URL-synchronized filters, stable cursor ordering, headless table patterns, virtualization tradeoffs, selection reducers, and CSV correctness.

**Evidence:** ordering properties, URL round trips, keyboard table checks, CSV fuzz tests, and measured large-table rendering.

**Decision:** explain when virtualization helps and what accessibility cost it introduces.

## Sprint 12 — Analytics dashboard

**Outcome:** Authors see completion, drop-off, field summaries, and time-to-complete with clearly stated denominators and date ranges.

**Teach:** typed aggregation, temporal semantics, chart accessibility, memoization, worker boundaries, and honest performance measurement.

**Evidence:** fixture-based report tests, empty/sparse cohort tests, accessible data-table alternatives, and profiling before/after evidence.

**Decision:** define every metric before implementing its chart.

## Sprint 13 — Comments and version history

**Outcome:** Teammates comment on fields, mention collaborators, resolve discussions, and inspect immutable version differences.

**Teach:** optimistic mutations, rollback, temporary identity, cache invalidation, reducer reconciliation, diff presentation, and audit trails.

**Evidence:** failed-mutation rollback test, duplicate-retry test, mention parser properties, and a version-diff integration test.

**Planted incident:** initially leave one failed optimistic comment visible, then repair it with a reproducing test.

## Sprint 14 — Accessibility, performance, and resilience

**Outcome:** The authoring and respondent experiences meet the course accessibility checklist, remain responsive on large forms, and recover from network or render failures.

**Teach:** WCAG-oriented interaction design, focus restoration, live regions, profiling, render causality, code splitting, error telemetry, offline detection, and recovery states.

**Evidence:** axe suite, keyboard journey, screen-reader notes, Playwright critical path, bundle budget, React profiler evidence, and simulated network failure.

**Planted incident:** harvest the drag-only exclusion and replace it with an equivalent keyboard workflow.

## Sprint 15 — Production readiness and retrospective

**Outcome:** FormForge has deterministic demo data, operational runbooks, observability boundaries, security and privacy audits, release evidence, and an honest course retrospective.

**Teach:** release thinking, structured logs, service-level indicators, incident response, data retention, dependency risk, deployment checks, and communicating uncertainty.

**Evidence:** complete quality gate, demo rehearsal, seed verification, dependency and secret scans, simulated incident, release checklist, and flaw ledger. Publish `v1.0.0`.

**Decision:** separate demonstrated readiness from claims that require a real production environment.

## As shipped: where v1.0.0 differs from this plan

*Checked against `main` @ `c1b2a71` on 2026-10-06.* This plan was written before the sprints ran; read it
alongside what actually merged (PRs #5–#75, 60 stakeholder issues) so the plan's promises aren't mistaken for
repository features.

- **Planted incident #5 changed.** Sprint 04 shipped pointer *and* keyboard reordering together (PR #20:
  "add pointer and keyboard ordering"; native HTML drag events in `apps/web/src/FormBuilder.tsx` plus visible
  move controls), so there was never a drag-only flaw. The fifth harvested flaw is instead **reorder lost
  keyboard focus**, and the first is **row state followed array position**. The authoritative list is
  `docs/sprints/flaw-ledger.md`; the red/green pairs are the first ten commits of PR #70.
- **No end-to-end browser tests.** The Sprint 09 "history-navigation E2E test" and Sprint 14 "Playwright
  critical path" were not built — there is no Playwright dependency or E2E directory. Back-navigation is
  covered by `packages/core/src/flow.test.ts` ("moves back through actual history…") and the jsdom component
  test `apps/web/src/MultiPageForm.test.tsx`. The Sprint 15 release audit records the skipped browser sweep as
  an evidence exception (`docs/audits/sprint-15-release.md`).
- **Virtualization and worker boundaries were not implemented.** Sprint 11's explorer pages with a cursor
  (`queryResponses` in `packages/core/src/responses.ts`) rather than virtualizing; Sprint 12 has no Web Worker.
  The Sprint 14 performance evidence is a raw bundle budget (`scripts/check-bundle.mjs`: 450 KiB JS / 30 KiB
  CSS) and a lazily loaded analytics route (`lazy(...)` in `apps/web/src/App.tsx`), not React Profiler output.
- **Test evidence at release:** 77 Vitest cases — 34 core, 9 data, 27 web, 7 API (see `TESTING.md` for how to
  recount). CI (`.github/workflows/ci.yml`) runs `pnpm audit --audit-level=high`, `pnpm gate`, and a gitleaks
  secret scan.

## Review standard across all sprints

Review should ask four questions repeatedly:

1. What user-visible contract does this code establish?
2. Which state owns the truth, and can another state disagree with it?
3. What failure, permission, accessibility, or timing path is absent?
4. What evidence would make the claim stronger?

The goal is not merely to finish fifteen increments. It is to help the learner acquire a repeatable way to reason about React applications under change.
