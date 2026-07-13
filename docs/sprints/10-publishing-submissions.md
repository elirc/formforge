# Sprint 10: Publishing and submissions

## Outcome

FormForge can publish immutable versions, serve a public form route, validate anonymous submissions against the published snapshot, and deduplicate concurrent retries.

## Evidence

- Repository tests cover publication history and concurrent idempotency.
- API tests prove cross-workspace denial, public reads, validation failure, and retry deduplication.
- The React route test completes the published demo and receives a stable receipt.

## Review prompts

- Why must submission validation use a publication instead of the current draft?
- Which layer must make idempotency atomic?
- What additional controls would anonymous public writes need in production?
