# 45. Build gates and the meaning of a green check

FormForge has workspace scripts for linting, type checking, testing, building, and a raw asset budget. A green command is useful evidence only when its scope and inputs are understood. This chapter reads [package.json](../../package.json), [turbo.json](../../turbo.json), and [check-bundle.mjs](../../scripts/check-bundle.mjs) to design a bounded verification plan. It does not run the application gate or install dependencies. Answers are in the [final review](review-15-release-evidence-and-final-defense.md).

## Read the command graph

The root gate invokes Turbo for lint, typecheck, test, and build, then runs sizecheck only if that command succeeds. The shell conjunction means a failure prevents the later sizecheck from running. The report must not say all checks passed merely because an early task passed or because the final command was never reached.

The Turbo configuration makes build depend on dependency builds and gives lint, typecheck, and test dependency-build prerequisites. Build outputs are declared under dist, while test outputs include coverage. This is a task graph, not a simple promise that every command runs in a fixed human-readable sequence. A verification report should identify the actual command and observed outcome rather than invent a chronological order among independently scheduled tasks.

Workspace scripts differ by package. The web builds through Vite, while API/core/data builds use tsup. Tests use Vitest with passWithNoTests. That option means an invocation can succeed even when no tests are discovered. A successful exit code therefore needs discovery/output context before it is described as a meaningful test run. The current repository does contain focused tests, but the option remains relevant when paths or filters change.

## Type checking is not runtime validation

TypeScript checks relationships among declared types. It does not validate arbitrary HTTP JSON or browser storage at runtime. The API's schema parser and answer parser remain necessary even when typecheck passes. A cast from unknown to a domain type can satisfy a compiler while allowing malformed data to reach business logic.

Conversely, runtime tests do not replace type checking. A component prop mismatch or an unhandled discriminated-union variant can be caught statically even if the test fixture never exercises that path. The renderer's never-based unreachable helper illustrates a compile-time exhaustiveness pattern, while actual untrusted schemas still need parsing before they become trusted Field values.

Linting addresses another set of rules. It can detect selected code-quality or correctness patterns, but it does not establish domain behavior such as publication-scoped replay or conditional draft atomicity. A green lint result is valuable within its configured rules; it should not be used as a substitute for a conflict trace or a transaction test.

## Build success and runtime integration

A successful build establishes that the configured bundlers produced outputs for the supplied sources and environment. It does not prove the browser can reach the API, that the demo callbacks are connected to persistence, or that a deployment has the intended environment variables. The course repeatedly identified explicit demo boundaries because build success cannot erase them.

The web's lazy analytics import can affect chunk structure. A build can produce a separate chunk, but that alone does not prove the user never downloads it or that initial interaction meets a performance target. Runtime navigation and loading behavior require their own observations. Avoid turning a code-splitting mechanism into an unmeasured user-experience guarantee.

Similarly, generating API type declarations does not prove a server starts correctly under the intended runtime or that durable dependencies are available. A release plan can include startup and readiness checks in an isolated environment, but those are additional evidence, not implicit consequences of a bundle file existing.

## Understand the asset budget

The sizecheck script reads the immediate files in apps/web/dist/assets, sums raw byte sizes of filenames ending in .js and .css, and compares them with limits of 450 KiB and 30 KiB respectively. It reports raw totals. It does not measure compressed transfer size, initial-route bytes, source maps, images, or browser execution time.

The script includes all matching immediate asset files, including lazy chunks, in the JavaScript sum. Therefore, code splitting can improve initial loading while leaving the total raw budget similar. Conversely, a smaller raw bundle can still execute slowly if the code performs expensive work on render. Bundle size and runtime responsiveness are related but distinct measurements.

The strict comparison rejects totals above the limit, while equality is allowed. Missing build output causes the filesystem read to fail rather than proving a zero-byte bundle. A stale dist directory can produce a measurement of old outputs if sizecheck is run independently without a trustworthy build step. The gate's build task helps establish the intended sequence, but the evidence report should still identify what was run and whether outputs were current.

## Caches and evidence provenance

Task caching can avoid repeated work, but a cached success is evidence about the inputs represented by the cache key. A report should not automatically claim a task executed fresh when the runner restored a result. Both can be legitimate, provided the source, configuration, dependency, and environment assumptions are understood.

For a documentation-only addition, running broad application suites may be unnecessary when no runtime behavior changed. The course's new pure models were tested directly, and link/exercise checks validate the authored material. That is an honest bounded verification choice. If a later learner changes a reducer or API route, the relevant package tests and type/build checks become appropriate according to the change.

Do not install dependencies or mutate lockfiles merely to make a documentation report look more comprehensive. A missing environment can be recorded as a limitation with the exact blocked command. When execution is authorized and needed, preserve the package-manager contract and distinguish setup changes from application changes in the report.

## Build a change-based verification matrix

For a renderer labeling change, select focused component and accessibility-state checks, then typecheck/build if the implementation changes. For a draft adapter, select repository contract tests and API mapping tests, including independent-client concurrency when a durable store is involved. For a CSV escaping change, select parser-aware cases and export integration. For a new Markdown chapter, select links, exercise coverage, and any runnable example checks.

The matrix should explain why each command matters and what it cannot establish. A long command list with no relation to the changed boundary is less useful than a small meaningful set. Broaden the plan when shared contracts change, failures reveal another risk, or a release requires a defined full gate. Avoid repeatedly rerunning unchanged suites after their evidence is already sufficient.

## Exercises

**FF-45A, eight points:** Trace the root gate and workspace task graph. Explain the effect of shell short-circuiting, dependency builds, and passWithNoTests on a truthful verification report.

**FF-45B, six points:** State the exact raw asset budget measurement, including file scope, units, excluded costs, equality behavior, and stale-output risk. Compare it with compressed transfer and initial interaction measurements.

**FF-45C, six points:** Create a change-based verification matrix for a renderer edit, durable adapter, CSV change, and documentation lab. Distinguish executed, cached, blocked, and not-required checks without inflating evidence.

## Exit evidence

A green check is a fact about a particular command, input, and assertion set. The engineer's job is to connect that fact to the behavior being claimed. Build gates become trustworthy when their limits are visible and their coverage is chosen for the actual change rather than for the appearance of thoroughness.
