# FormForge threat model

## Assets and boundaries

- Private workspace drafts and author identity cross an authenticated workspace boundary.
- Published schemas cross into an anonymous public-read boundary.
- Respondent answers and idempotency keys enter through an anonymous write boundary.
- Publication and submission repositories are authoritative; browser state is not.

## Threats and current controls

| Threat | Control | Evidence |
| --- | --- | --- |
| Cross-workspace publication | Compare authenticated workspace identity with the route workspace | API denial test |
| Malformed schema or answer values | Runtime parsing plus domain validation | 400/422 API tests |
| Draft edits changing response meaning | Immutable versioned publication snapshots | Repository version test |
| Duplicate responses after retries | Atomic publication-scoped idempotency key | Concurrent retry test |
| Guessing an unpublished slug | Public lookup returns only publication records | 404 boundary |

## Follow-up controls for a real deployment

Rate limiting, abuse detection, durable database constraints, encrypted transport and storage, retention enforcement, authentication middleware, audit logs, CSRF policy for cookie-based auth, and operational alerting remain deployment responsibilities. The in-memory adapters teach contracts; they are not production storage.
