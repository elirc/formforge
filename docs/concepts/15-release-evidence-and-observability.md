# Release evidence and observability

Release readiness is a set of falsifiable claims. A build proves compilation, a focused test proves one behavior, a browser journey proves integration, and a runbook proves that the team has rehearsed decisions. None proves every production property.

Structured events should name an event, timestamp, request identity, route template, outcome, and duration. They should not copy request bodies “just in case.” Correlation makes a single request traceable; aggregation turns events into rates and latency distributions; alerts then connect those signals to an owned response.

Liveness asks whether the process can answer. Readiness asks whether it should receive traffic. Keep them separate so orchestration can remove an unready instance without repeatedly killing a healthy process.

Exercise: inject a sink that derives error rate by route, then specify the minimum traffic volume needed before an alert is meaningful.
