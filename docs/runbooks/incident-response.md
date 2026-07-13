# Incident response runbook

## Detect and classify

Use readiness failures, error rate, request latency, and product reports. Declare severity from user impact and data risk. Assign an incident commander, operations lead, communications lead, and scribe; one person may hold multiple roles for a small team.

## Contain

Preserve evidence, correlate affected requests by request ID, and disable the narrowest unsafe path. Do not put respondent payloads into chat, tickets, or logs. For suspected disclosure, restrict access and follow the organization's legal notification process.

## Recover

Prefer a rehearsed rollback or feature disablement. Verify readiness, a synthetic author journey, and a retry-safe public submission before resolving. Monitor long enough to cover the original failure interval.

## Learn

Within two business days, publish a blameless timeline, contributing conditions, detection gaps, what went well, and actions with owners and dates. A test or runbook update is useful only when it targets a named failure mode.
