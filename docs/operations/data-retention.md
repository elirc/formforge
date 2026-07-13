# Data retention and privacy boundary

The demo dataset uses fictional `example.com` identities. Operational events contain route templates and request metadata, never form answers or request bodies.

A real deployment must set and enforce retention by data class: drafts, immutable publication schemas, submissions, collaboration comments, audit events, and backups. Product deletion must account for search indexes, exports, replicas, and backup expiry. Legal hold and tenant export requirements need explicit owners.

This repository demonstrates boundaries but does not claim enforcement without durable storage, identity, and deployment policy.
