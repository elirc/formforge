# FormForge

FormForge is a schema-driven form builder and response analytics platform designed as a fifteen-sprint teaching repository for a junior software engineer.

The product is intentionally frontend-heavy. A learner will build a visual editor, an accessible public form runtime, conditional rules, autosave, optimistic collaboration, response exploration, and analytics. Each feature creates a practical reason to learn React and TypeScript beyond syntax.

## Why this project

A form builder is a compact product with unusually rich engineering problems:

- React component composition and reusable UI primitives;
- controlled inputs, reducers, context, custom hooks, and derived state;
- TypeScript discriminated unions, generics, narrowing, and exhaustive checks;
- drag-and-drop plus an equivalent keyboard interaction model;
- local state, server state, URL state, and persisted draft state;
- validation, conditional logic, recursive data, and cycle detection;
- optimistic updates, autosave conflicts, retries, and recovery;
- accessible authoring and public submission experiences;
- performance work on large schemas and response tables;
- unit, component, integration, property, accessibility, and end-to-end tests.

The result should feel like a small Typeform or Google Forms rather than a collection of tutorial exercises.

## Product brief

Form authors can create workspaces, build forms from typed field blocks, preview and publish versions, add validation and conditional rules, and review submissions. Respondents receive an accessible, mobile-friendly experience that can save progress safely. Teams can comment on drafts and inspect version history.

The first release will support text, email, number, choice, checkbox, date, and content blocks. Payments, arbitrary code execution, external automation, and true multi-user cursor editing are intentionally out of scope.

## Proposed stack

- React and strict TypeScript for the authoring and response applications;
- Vite for local development and production builds;
- TanStack Router and TanStack Query for URL and server state;
- Zod at untrusted runtime boundaries;
- dnd-kit with a first-class keyboard reordering path;
- Fastify and a repository boundary for the TypeScript API;
- Prisma with PostgreSQL as the production data model and deterministic in-memory adapters for teaching;
- Vitest, React Testing Library, fast-check, axe, and Playwright for layered evidence;
- pnpm workspaces and GitHub Actions for repeatable quality gates.

Exact dependency versions will be pinned during Sprint 1 after checking current stable releases.

## Fifteen-sprint path

| Sprint | Product outcome | React and TypeScript emphasis |
| --- | --- | --- |
| 01 | Foundations and app shell | strict configuration, component boundaries, semantic layout |
| 02 | Typed schema and form renderer | discriminated unions, exhaustive rendering, recursive composition |
| 03 | Visual builder basics | reducers, immutable updates, controlled inputs, derived state |
| 04 | Reordering and field library | stable identity, drag-and-drop, keyboard interaction, focus |
| 05 | Validation, preview, and first demo | error modeling, form events, error boundaries; `v0.5.0` |
| 06 | Workspaces, routing, and loading states | nested routes, URL state, query boundaries, Suspense decisions |
| 07 | Draft persistence and autosave | custom hooks, debouncing, stale closures, version conflicts |
| 08 | Conditional logic | recursive rules, narrowing, cycle detection, property tests |
| 09 | Multi-page forms and branching | state machines, progress derivation, resumable sessions |
| 10 | Publishing and public submissions | immutable versions, runtime validation, trust boundaries |
| 11 | Response explorer | typed filters, pagination, virtualization, table accessibility |
| 12 | Analytics dashboard | typed aggregation, chart semantics, memoization evidence |
| 13 | Comments and version history | optimistic mutations, rollback, cache invalidation, audit trails |
| 14 | Accessibility, performance, and resilience | profiling, code splitting, offline/error recovery, axe and E2E |
| 15 | Production readiness and retrospective | observability, threat model, runbooks, demo, evidence audit; `v1.0.0` |

Read the detailed [15-sprint plan](docs/15-SPRINT-PLAN.md) and [learning outcomes](docs/LEARNING-OUTCOMES.md) before beginning Sprint 1.

## Teaching process

Every sprint should have one GitHub milestone, four stakeholder-shaped issues, and one sequential pull request. The pull request includes ordered commits, focused tests, an ADR, a concept note, inline teaching comments, an author/reviewer exchange, and one genuine design debate. CI must be green before merge.

The course uses evidence rather than ceremony: tests must explain risk, performance claims need measurements, accessibility claims need keyboard and automated evidence, and security claims must name the protected boundary.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the sprint workflow and definition of done.

## Current status

The curriculum foundation and fifteen milestones are ready. Product implementation begins in Sprint 1.
