# Learning Outcomes

By the end of FormForge, a junior engineer should be able to own a medium-sized React and TypeScript feature from problem statement through production-readiness evidence.

## React

The learner can:

- design a component tree around responsibilities rather than page screenshots;
- distinguish canonical, derived, local, URL, and server state;
- use reducers and action unions for complex transitions;
- explain when an effect is synchronization and when it is avoidable;
- build custom hooks with correct dependencies, cleanup, and cancellation;
- manage focus, keyboard interaction, live feedback, and error summaries;
- diagnose excess rendering with measurements before adding memoization;
- implement optimistic UI with rollback and reconciliation;
- design loading, empty, error, success, conflict, and offline states.

## TypeScript

The learner can:

- model variants with discriminated unions and exhaustive checks;
- use generics when they preserve a relationship between inputs and outputs;
- narrow unknown data at runtime rather than asserting it is safe;
- separate domain types, transport types, persistence models, and view models;
- use readonly data and explicit transitions to protect invariants;
- understand when a type is documenting intent but cannot enforce runtime truth;
- write type-safe reducers, event handlers, query keys, and component APIs.

## Testing

The learner can:

- select a test layer based on risk rather than habit;
- write behavior-focused unit and component tests;
- use generated data to test invariants over a broad input space;
- control clocks, identity, and asynchronous work for deterministic evidence;
- exercise retries and races concurrently;
- test keyboard behavior and automated accessibility rules;
- write a defect reproduction before applying the fix;
- explain what a passing test does and does not prove.

## Product engineering

The learner can:

- turn stakeholder language into narrow, reviewable issues;
- identify trust, permission, and privacy boundaries;
- design retry-safe mutations and visible recovery experiences;
- define metrics before visualizing them;
- use ADRs to preserve architectural context;
- review code by tracing state, failure paths, and observable contracts;
- communicate performance and readiness claims with appropriate limits;
- use runbooks and retrospectives to improve the engineering system.

## Progress rubric

| Stage | Observable behavior |
| --- | --- |
| Guided | Implements a small component or domain transition from an example and explains its props and state. |
| Contributing | Independently adds a focused feature with tests and handles obvious loading/error states. |
| Integrating | Chooses appropriate state ownership, runtime boundaries, and test layers across components and API calls. |
| Owning | Anticipates concurrency, accessibility, performance, and operational risks; proposes evidence and tradeoffs before review. |

The final assessment should use the repository history, review conversations, defect harvests, and retrospective—not only the finished demo.
