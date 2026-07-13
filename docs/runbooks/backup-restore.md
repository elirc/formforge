# Backup and restore runbook

FormForge v1 ships deterministic in-memory repository adapters for teaching and CI. They are process-local and intentionally have no durable backup. Never deploy them for real respondent data.

A production repository must define:

- encrypted point-in-time backups and an independent retention location;
- recovery-point and recovery-time objectives owned by the business;
- a tested restore command for data and schema versions;
- tenant-scoped export and deletion procedures;
- checksums, access logs, and quarterly restore rehearsals.

## Restore rehearsal

Restore the newest backup into an isolated environment, apply only reviewed migrations, compare tenant/form/submission counts, sample immutable publication versions and idempotency records, run API smoke probes, and record achieved recovery time and data-loss window. Do not declare a backup successful until a restore has been demonstrated.
