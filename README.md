# FormForge

FormForge is a complete, schema-driven form builder and response analytics platform built as a fifteen-sprint React and TypeScript teaching repository. A junior engineer studies the issues, ordered commits, pull-request reviews, architecture decisions, counterexamples, and tests that produced the product.

Version `1.0.0` includes typed authoring, seven field variants, validation, conditional logic, multi-page branching and resume, immutable publishing, retry-safe submissions, response filtering and CSV export, analytics, comments, version diffs, accessibility checks, autosave recovery, and operational readiness boundaries.

## Run the release candidate

```bash
pnpm install
pnpm seed
pnpm dev
```

`pnpm seed` verifies the canonical demo scenario and prints a deterministic fingerprint. The development command starts the Vite application and Fastify API. No database, Docker daemon, or external service is required.

Run the complete local evidence gate with:

```bash
pnpm gate
```

## Architecture

```mermaid
flowchart LR
  Browser[React 19 + Vite] --> Core[@formforge/core\ntyped domain rules]
  Browser --> API[Fastify API\nruntime boundaries]
  API --> Core
  API --> Data[@formforge/data\nrepository contracts + in-memory adapters]
  Data --> Core
  CI[GitHub Actions] --> Checks[lint + typecheck + tests + build\nsecret scan + bundle budget]
```

The browser owns interaction and presentation state. `@formforge/core` owns pure schemas, reducers, validation, branching, response queries, analytics, and diffs. The API validates untrusted HTTP data and authorization context. `@formforge/data` demonstrates versioned repository contracts with deterministic in-memory adapters; durable deployment storage remains an explicit production integration, not a claim made by this repository.

## Implemented stack

- React 19, strict TypeScript, Vite, TanStack Router, and TanStack Query;
- Fastify with Zod-backed domain parsing at HTTP boundaries;
- pnpm workspaces and Turborepo;
- Vitest, React Testing Library, fast-check, jsdom, and axe-core;
- GitHub Actions quality, dependency-audit, secret-scan, and bundle-size gates.

Dependencies are pinned exactly. The project deliberately uses visible reorder controls with an equivalent keyboard path instead of hiding behavior behind a drag library. It does not claim a production database, authentication provider, rate limiter, or real monitoring system.

## Study the repository

Start with the [fifteen-sprint plan](docs/15-SPRINT-PLAN.md), then study each merged pull request in order: stakeholder issues, commits, inline review discussion, design debate, tests, ADR, and concept note. The [course retrospective](docs/COURSE-RETROSPECTIVE.md) summarizes what each sprint should teach, and the [revealed flaw ledger](docs/sprints/flaw-ledger.md) connects five realistic defects to their failing counterexamples and repairs.

Testing has its own junior-focused guides: [why tests were added](TESTREADME.md) and the [layered testing strategy](TESTING.md). [CONTRIBUTING.md](CONTRIBUTING.md) records the repeatable sprint workflow.

## Release boundaries

The v1 release demonstrates product behavior, strict compilation, deterministic test and seed evidence, accessibility automation, responsive browser journeys, bundle budgets, repository contracts, and operational documentation. Encryption, durable backups, retention enforcement, authentication, rate limiting, alert routing, and service-level objectives require a chosen deployment environment and are tracked honestly in the [threat model](docs/security/threat-model.md) and [runbooks](docs/runbooks/deploy.md).

Payments, arbitrary code execution, outbound automation, and live multi-user cursors are out of scope.
