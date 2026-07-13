# Sprint 12: Analytics dashboard

## Outcome

FormForge now computes and displays form starts, completions, completion rate, median completion duration, page drop-off, and role mix with explicit denominators.

## Evidence

- Core tests cover empty and sparse data, an even-sized median, denominator choices, and generated completion bounds.
- Component tests verify named denominators, exact table fallbacks, and the empty state.
- Local build size and timing are recorded with environment and scope rather than presented as production claims.

## Review prompts

- What population is excluded from median completion time?
- Why is a zero value sometimes less honest than an empty state?
- Which claims can and cannot be made from a local production build?
