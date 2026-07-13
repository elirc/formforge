# Deploy and rollback runbook

## Preconditions

1. Start from a clean, reviewed commit on `main`.
2. Run `pnpm install --frozen-lockfile`, `pnpm seed`, and `pnpm gate`.
3. Confirm GitHub quality and secret-scan jobs are green.
4. Review dependency-audit output, the bundle budget, schema changes, and the release checklist.

## Deployment contract

Build immutable web and API artifacts from the same commit. Inject configuration and an operational event sink at runtime. Expose `/health` as liveness and `/health/ready` as readiness. Route traffic only after readiness succeeds. Do not place secrets in Vite-prefixed client variables.

## Verification

- Load the home, builder, responses, analytics, and public-form routes.
- Perform one synthetic publish and idempotent submission against a non-production workspace.
- Verify request correlation, 4xx/5xx rates, latency, and readiness from the deployment environment.

## Rollback

Remove the candidate from traffic, restore the last known-good immutable artifact, and verify readiness before shifting traffic back. If a durable schema change is not backward compatible, stop: follow the database-specific forward-fix or restore plan reviewed with that migration. Record the decision and timestamps in the incident log.
