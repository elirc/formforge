# Sprint 12 local performance evidence

Measured on 2026-07-13 on the course-author Windows workstation with Node 22, pnpm 9.15.4, and Vite 8.1.4.

| Measurement | Observed value |
| --- | ---: |
| Vite-reported production build | 0.994 s |
| End-to-end pnpm process wall time | 4.64 s |
| JavaScript output | 411.21 kB raw / 123.83 kB gzip |
| CSS output | 17.93 kB raw / 4.47 kB gzip |

These are repeatable local build observations, not production latency claims or user-experience percentiles. Sprint 14 will use the bundle output as a baseline for route-level loading work.
