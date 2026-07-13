# FormForge threat model

## Assets and trust boundaries

- Private workspace drafts, comments, and author identity cross an authenticated author boundary.
- Published schemas cross into an anonymous public-read boundary.
- Respondent answers and idempotency keys enter through an anonymous write boundary.
- Repository records are authoritative; browser state and request headers are untrusted inputs.
- Operational events cross into a monitoring boundary and must not become a shadow response store.

## Demonstrated controls

| Threat | Control | Evidence |
| --- | --- | --- |
| Cross-workspace publication | Compare workspace context with the route workspace | API denial test |
| Malformed schema or answers | Runtime parsing plus domain validation | 400/422 API tests |
| Draft edits changing a live form | Immutable versioned publication snapshots | Repository version tests |
| Duplicate responses after retries | Publication-scoped idempotency key | Concurrent retry test |
| Spreadsheet formula execution | Prefix dangerous CSV cells before quoting | Property and example tests |
| Rule denial of service through recursion | Reject missing, self, and multi-node cyclic dependencies | Graph counterexample tests |
| Optimistic state hiding a failed write | Roll back by temporary identity and preserve retry input | Component rejection test |
| Sensitive answers copied into logs | Operational event type omits bodies and answer data | API structured-event test |
| Dependency or secret drift | Frozen versions, audit job, and secret scan | GitHub Actions |

## Deployment-owned controls

Authentication middleware, durable tenant-scoped authorization, rate limiting, abuse detection, encrypted transport/storage, database constraints, CSRF policy for cookie auth, monitoring retention, alert routing, and verified backup/restore require the selected environment. The in-memory adapter is not suitable for real respondent data.

## Privacy decisions

Routes are logged as templates, not user-supplied URLs. Request IDs accept a conservative character set and length. Request bodies, form answers, comment bodies, and email addresses are absent from operational events. The demo seed uses fictional `example.com` addresses. Retention and deletion obligations are described in `docs/operations/data-retention.md` but cannot be enforced until durable storage and identity exist.

## Review triggers

Revisit this model when adding authentication, a durable adapter, file uploads, outbound integrations, custom code, payment data, or cross-tenant administration. Each trigger changes both the attack surface and the evidence required for release.
