# FormForge over-engineering review

## Executive verdict

FormForge is over-engineered for a small standalone form-builder demo, but not uniformly over-engineered for its stated purpose as a teaching repository. Strict TypeScript, pure domain logic, accessible interactions, repository interfaces, in-memory fakes, and behavior-focused tests earn their cost because they create reusable lessons and protect real invariants.

The main problem is **ceremonial architecture**: some boundaries, tools, and operational artifacts look production-shaped without participating in the running product. The clearest example is the web/API split. The browser uses imported demo fixtures and local promises; it never calls the Fastify API or `@formforge/data`. Maintaining both paths increases concepts and files without delivering an end-to-end boundary.

The best simplification is not “put everything in one file.” It is to choose one honest product shape and make every retained abstraction earn its place.

## Evidence reviewed

This review inspected the complete `v1.0.0` source tree, package graph, CI workflow, test suite, documentation, Git history, and GitHub issue/PR process.

- 1,431 lines of production TypeScript/TSX across 31 files.
- 778 lines of test TypeScript/TSX across 26 files; 77 tests pass.
- 66 Markdown files containing 782 lines.
- 15 merged sprint PRs, 60 closed issues, and 15 closed milestones.
- 144 inline review comments and 61 issue/PR conversation comments.
- 8,120 additions and 193 deletions across the sprint PRs; this includes generated lockfile and documentation churn.
- Four workspaces: one web app, one API app, and two internal packages.

Those numbers are not automatically bad. They show that the curriculum and review process are nearly as large a deliverable as the product. That is appropriate only while every artifact remains useful to a learner.

## Complexity classification

| Area | Product value | Teaching value | Verdict |
| --- | --- | --- | --- |
| Strict TypeScript and discriminated unions | High | High | Keep |
| Pure validation, branching, analytics, CSV, and diff functions | High | High | Keep |
| Behavior, property, API, and accessibility tests | High | High | Keep |
| Keyboard-equivalent reordering and focus recovery | High | High | Keep |
| Repository interfaces with in-memory fakes | Medium | High | Keep if the API is wired in |
| Separate web/API/data workspaces | Low today | High | Wire together or collapse |
| TanStack Query for one promise-backed demo lookup | Low | Medium | Simplify or use fully |
| TanStack Router with one generic `$view` route | Medium | Medium | Use distinct typed routes or simplify |
| Turborepo for four small workspaces | Low/medium | Medium | Optional; simplify task dependencies |
| Route-splitting a roughly 4 KiB analytics module | Very low | Medium | Remove unless measurement supports it |
| Typed operational events and readiness probes | Low without deployment | Medium/high | Keep as an appendix, not proof of production |
| One ADR and concept note per sprint | Low after the fact | High when substantive | Consolidate thin artifacts |
| Fixed quotas for issues and review comments | None | Medium | Replace quotas with outcome-based review |

## Where the repository is over-engineered

### 1. The web/API boundary is not an execution boundary

`apps/api` implements draft, publish, public-form, submission, health, and readiness routes. `packages/data` implements draft, publication, submission, and comment repositories. However, `apps/web` imports only `@formforge/core`; it contains no API client and makes no `fetch` request.

The web app instead:

- resolves a workspace from an imported `demoWorkspace` after `Promise.resolve()`;
- simulates server versions with a component `useRef`;
- renders imported demo responses and analytics journeys;
- creates a fixed public receipt in component state;
- keeps collaboration behavior local to the component.

This is the highest-cost mismatch in the repository. The learner must understand HTTP validation, repositories, query caching, and local simulations, yet cannot follow one user action across those layers.

**Recommendation:** choose one of two honest modes.

1. **Product-shaped mode:** add a small typed API client, connect Query and mutations to Fastify, and run the web/API together. Keep repository interfaces and in-memory adapters.
2. **Frontend curriculum mode:** remove `apps/api` and `packages/data`, place async fakes behind a small client interface in the web app, and teach the HTTP boundary in an optional extension.

Do not continue maintaining two implementations of the same product behavior.

### 2. The seed command verifies a fixture but does not seed the application

`pnpm seed` serializes a fixed dataset twice, compares it, and prints a fingerprint. It does not populate a repository or change what `pnpm dev` displays; the app already imports the same demo constants.

That is a useful deterministic-fixture check, but “seed” implies initialization.

**Recommendation:** rename it to `pnpm demo:verify`, or make it hydrate the same repository the API serves. A command should describe the effect it actually has.

### 3. TanStack Query is present before there is server state

The only workspace query wraps an immediately resolved local fixture. Query caching, stale time, invalidation, retry policy, and network lifecycle have little product effect in that arrangement.

**Recommendation:** either connect Query to the API and use query keys/invalidation for real draft and publication mutations, or replace the current lookup with a route loader/local async function. Keep the dependency when it owns genuine remote state.

### 4. The router is underused

Builder, responses, and analytics are encoded as one `/workspaces/$workspaceId/$view` route, followed by a manual string check and conditional rendering. This sacrifices much of the typed route tree, loader, and error-boundary value that justified TanStack Router.

**Recommendation:** define three child routes with their own components/loaders, or use a lighter routing approach. A sophisticated router plus manual view dispatch is an awkward middle state.

### 5. The task graph performs unnecessary prerequisite builds

Turborepo makes `lint`, `typecheck`, and `test` depend on upstream `build` tasks even though internal packages export their TypeScript source and tests/typechecking consume source directly. This increases gate topology and declaration-build work without being required for correctness.

**Recommendation:** let `lint`, `typecheck`, and `test` run against source independently. Keep `build` as its own release gate. Retain only dependencies that a task genuinely consumes.

For a repository this size, pnpm workspace scripts alone would also be adequate. Turborepo remains defensible if teaching task graphs and future growth is intentional.

### 6. The analytics split is too small to justify itself

The production build isolates an analytics chunk of roughly 4 KiB while the main JavaScript remains about 415 KiB raw. The added `lazy`, dynamic import, and Suspense boundary have negligible transfer benefit at that size.

**Recommendation:** remove the split until profiling identifies a material route payload, or document it strictly as a code-splitting lesson rather than a performance optimization.

### 7. Operations maturity is ahead of product maturity

Readiness probes, structured events, a threat model, deployment/rollback guidance, retention notes, backup/restore guidance, and a simulated postmortem are thoughtful teaching artifacts. They do not make an in-memory, unauthenticated, disconnected demo production-ready.

The repository generally admits this limitation, which is good. The remaining over-engineering is placement and emphasis: production operations occupy a large conceptual surface before a durable store, identity boundary, deployment target, or monitoring backend exists.

**Recommendation:** group these materials under “production extension” and make the prerequisites explicit. Implement operational integrations only after selecting a real deployment and storage model.

### 8. Documentation is over-fragmented

There are 66 Markdown files for 1,431 lines of production TypeScript/TSX. Twelve concept notes are only four lines, and most ADRs are seven to nine lines. Small files can aid focused learning, but dozens of thin pages increase navigation cost and can look like completed analysis without containing alternatives, consequences, or examples.

**Recommendation:** consolidate the thin concept notes into four phase guides:

- typed React foundations;
- state, effects, and concurrency;
- graphs, state machines, and data boundaries;
- testing, accessibility, and operations.

Keep standalone ADRs only for decisions with a real rejected alternative and a lasting consequence. Link from one curriculum index so learners do not have to discover the intended order from filenames.

### 9. The GitHub process uses quotas where judgment would teach more

The process produced exactly four issues per sprint, roughly ten inline comments per PR, a repeated general-comment exchange, one ADR, and one concept note. This consistency proves the ritual was followed, but the volume can dilute the best lessons. Across 15 PRs, 205 review/conversation comments compete for attention with a small codebase.

The deliberate red/green flaw history is different: it is high-value ceremony because the commit order proves each test detected the intended defect.

**Recommendation:** keep sequential PRs and red/green incidents, but replace fixed quotas with quality gates:

- one outcome issue plus only the tasks needed to coordinate risk;
- three to five inline comments on the most important lines;
- an ADR only when a durable decision exists;
- one genuine unresolved question or trade-off, not a scripted exchange requirement;
- a short PR study guide pointing to the highest-value commit and test.

## Complexity that is justified

The following should not be removed in a simplification pass:

- `@formforge/core` as a framework-independent home for schemas and pure business rules;
- discriminated field unions and exhaustive rendering;
- separate authoring and respondent validation;
- stable field identity and focus restoration;
- version-aware autosave behavior;
- graph cycle detection for conditional rules;
- immutable publications and submission idempotency;
- cursor ordering and CSV formula hardening;
- accessible tables, chart alternatives, live regions, and keyboard paths;
- controlled clocks, repositories, promises, and IDs in tests;
- the five counterexample-first defect repairs.

These mechanisms address concrete correctness, accessibility, security, or concurrency risks. Removing them would make the code smaller but the curriculum and product weaker.

## Not over-engineering: unfinished boundaries

Some missing pieces should not be described as simplification wins:

- no real web-to-API integration;
- no durable persistence;
- no authentication or object-level authorization;
- no actual backup/restore mechanism;
- no monitoring destination or alerting;
- no completed real-browser/device matrix in the release audit.

Those are deliberately acknowledged limits. If FormForge is promoted from curriculum demo to real product, they become required work rather than optional complexity.

## Recommended lean target

For the teaching repository, retain the current package boundaries only after connecting them:

```text
React routes/components
        |
        v
typed API client + TanStack Query
        |
        v
Fastify runtime validation
        |
        v
repository interfaces -> in-memory teaching adapter
        |
        +----------> future durable adapter

All layers share @formforge/core domain contracts.
```

Then simplify the surrounding ceremony:

1. Wire one complete draft → publish → submit → analyze journey through the API.
2. Remove the duplicate local simulations after that journey works.
3. Rename or implement the seed command honestly.
4. Split workspace views into real typed routes.
5. Remove build prerequisites from unrelated Turbo tasks.
6. Consolidate thin documentation and reduce review-comment quotas.
7. Re-measure bundle splitting after the architecture is connected.
8. Treat operations material as an explicit production extension until a deployment exists.

## Bottom line

FormForge's valuable complexity protects identity, time, graph, validation, accessibility, and trust-boundary invariants. Its wasteful complexity comes from **boundaries and ceremony that are present but not exercised**.

As a curriculum, the repository is intentionally more elaborate than the product requires. As a product, it should either connect the web, API, and data layers or collapse them. The next improvement should be subtraction through integration: make one path real, then delete every duplicate path and document that no longer earns its keep.
