# Concept 10: Trust boundaries and retries

Every HTTP body, header, route parameter, and browser-stored value is untrusted at runtime. TypeScript helps the implementation after parsing; it cannot validate network bytes. FormForge parses schemas and answers, checks workspace authority, and validates responses against the published snapshot.

Network success is ambiguous: a server may commit a submission while the response is lost. Retrying is correct only when the operation is idempotent. The client supplies a stable request key, and the repository atomically returns the original result for duplicate attempts.

Immutability connects the two ideas. Validation must target the version the respondent saw, not whichever draft happens to exist when the request arrives.
