# Sprint 15 release audit

## Automated evidence

- Lint: all four packages pass.
- Strict typecheck: all four packages pass.
- Tests: 34 core + 9 data + 27 web + 7 API = 77 passing.
- Production build: web, API, core, and data artifacts pass.
- Bundle: 409.1 KiB JavaScript / 450 KiB; 19.5 KiB CSS / 30 KiB.
- Dependency audit: no high-severity finding; one low-severity advisory remains recorded by the package manager.
- Seed: scenario `formforge-v1`, fingerprint `6a585e3875d39b2e`, 1 workspace, 1 form, 18 responses, 1 comment.

## Runtime probes

The Vite development server returned HTTP 200 for `/`, builder, responses, analytics, and public-form entry routes. The API returned healthy liveness and readiness responses. Structured stdout contained the supplied `release-probe-live` and `release-probe-ready` request IDs, route templates, status, and duration without request bodies.

## Interaction acceptance and exception

The component integration suite exercises navigation, reorder focus continuity, response filtering, lazy analytics rendering, public-form completion, and responsive preview switching. Live probes confirm every SPA entry route returns the application shell.

The planned in-app desktop and narrow-viewport visual sweep could not run because the browser-control runtime was unavailable. HTTP and jsdom evidence do not prove pixel layout or real assistive-technology behavior, so this is recorded as a release evidence exception rather than a passing browser claim. A deployment owner should perform the visual/device matrix before exposing real respondent traffic.
