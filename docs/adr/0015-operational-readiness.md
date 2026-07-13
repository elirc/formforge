# ADR 0015: Demonstrated readiness is separate from deployment readiness

## Decision

FormForge exposes separate liveness and readiness boundaries, emits request-correlated structured events through an injected sink, and keeps deterministic release fixtures in the data package. The repository documents deployment-owned controls instead of simulating them with misleading placeholders.

## Alternatives considered

- Enabling Fastify's default logger would produce output quickly, but would couple tests to a logger and make payload-redaction policy less visible.
- Calling `/health` for both process and dependency state would make an unavailable dependency look like a dead process and cause unsafe restart loops.
- Claiming the in-memory adapter is production storage would make backup and retention documentation fictional.

## Consequences

Tests can inspect complete operational events without capturing stdout. Request bodies and answers are absent by construction. A deployment must supply an event sink, dependency readiness probe, durable repository, alert routing, and retention enforcement before handling real respondent data.
