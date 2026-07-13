# Sprint 01: Foundations and app shell

## Outcome

FormForge now has a responsive semantic React shell, strict shared TypeScript configuration, an explicit Fastify boundary, package-level tests, and one local/CI quality gate.

## Review prompts

- Why is the shell almost stateless?
- Which failures are caught by TypeScript, lint, tests, and build respectively?
- What does a health endpoint prove, and what does it not prove?
- How does the skip link change keyboard navigation?

## Evidence

Run `pnpm gate`. The web test locates navigation and actions through their accessible roles. The API test injects the health request without opening a network port. The production build proves the package graph resolves from a clean entry point.
