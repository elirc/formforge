# 47. Contract ownership and maintainer review

FormForge separates core logic, repositories, API adapters, and React surfaces. That structure is useful only when each boundary has an explicit owner and evidence. This chapter develops a maintainer review method using [core exports](../../packages/core/src/index.ts), [data exports](../../packages/data/src/index.ts), [app.ts](../../apps/api/src/app.ts), and [App.tsx](../../apps/web/src/App.tsx). The [final review](review-15-release-evidence-and-final-defense.md) contains assessment guidance.

## Map responsibilities by contract

The core package owns schema types, parsing, validation, builder transformations, rules, flow transitions, response queries, and analytics helpers. The data package owns repository behavior and in-memory state. The API owns untrusted request parsing, route identity checks, status mapping, and injected operational boundaries. The web owns interaction state, presentation, and current demo adapters.

This map is descriptive, not a claim that every production concern is already implemented. Authentication, durable storage, publication-bound respondent sessions, and reliable business-event delivery remain proposed extensions in this course. A review should locate each new requirement at the boundary capable of enforcing it rather than distributing partial checks across unrelated components.

For example, hiding a Publish button can improve UX but cannot enforce workspace publication authority. A core validator can identify duplicate field IDs but cannot decide which authenticated actor may edit them. A repository can enforce optimistic versions but cannot infer whether the browser's current draft includes an unsaved edit. Each layer contributes a different fact.

## Avoid duplicate sources of truth

The builder calculates a predicted next schema for callbacks while React owns reducer state. The renderer stores answers while FormData collects submitted values. The dashboard combines journeys and responses supplied independently. These are not automatically design errors, but they are places where two representations can diverge unless their relationship is explicit.

For each pair, write the synchronization rule and authority. Does the callback report predicted or committed state? Does submission retain hidden answers or normalize them? Does the analytics view promise reconciled populations or display separate measures? A maintainer should be able to answer without reading unrelated UI code or relying on assumptions from a demo fixture.

A proposed refactor should reduce accidental duplication while preserving useful distinctions. Base/local/remote schemas in reconciliation are intentionally different sources of evidence, not redundant state to collapse. Current-page and full-session answers can also be distinct by design. The goal is not one variable for everything; it is one owner for each meaning and a defined transformation between meanings.

## Review dependency direction

Pure core functions are easier to test when they do not depend on browser storage, network clients, or repository instances. A proposed integration should keep side effects in adapters and pass explicit inputs into core logic. This lets the same validation or flow transition be exercised in a model, API, or UI without importing an environment that starts unrelated work.

The repository interfaces already provide useful injection points for the API. Preserve that advantage when adding durable adapters. Do not make core validation call a database to discover workspace permissions; combine those checks at an application-service boundary with clear ordering. Likewise, avoid importing a React component into an API test merely to reuse a private formatting helper. Extract a genuinely shared pure contract only when it has a stable meaning in both places.

Shared code is not automatically shared authority. A browser and server can call the same validator while only the server's result is authoritative for untrusted submissions. If the browser bundle lags behind the server, versioning and error recovery still matter. Reuse reduces drift but does not eliminate deployment compatibility concerns.

## Make proposals reviewable before implementation

A useful design note starts with a concrete trigger and expected outcome. For example, when a respondent retries after republishing, the server should preserve the loaded publication contract or return an explicit mismatch. Then state the changed protocol, storage invariants, client behavior, and evidence. Avoid beginning with a list of technologies before defining the behavior they must support.

Use a small decision record for genuine tradeoffs: publication-bound versus latest-only submission, live versus snapshot export, automatic versus manual reconciliation. Record the chosen policy, alternatives considered, and consequences that future maintainers need to understand. Do not retain every abandoned implementation idea as if it were part of the final contract.

The course's proposed modules can become such records, but they should be updated when implementation choices settle. A chapter describing several options is useful for learning; an operational runbook must identify the option actually deployed. Keep educational alternatives separate from authoritative deployment instructions.

## Review changes with counterexamples

For every important change, ask which prior counterexample is now handled and which adjacent invariant could regress. A publication-binding change should handle P1/P2 retries without breaking legitimate new submissions. A DOM namespace change should fix duplicate IDs without changing logical answer names. A query optimization should preserve equal-timestamp ordering and export scope.

Require one adversarial schedule when the change involves asynchronous ownership. Require one invalid-input case when it changes a trust boundary. Require one restart or independent-client case when it claims durable concurrency. These are not universal test-count rules; they are prompts to select evidence that crosses the relevant boundary.

Avoid implementation-mirroring tests that merely repeat the same arithmetic or branch structure without an independent expectation. A test asserting that a helper returns the value calculated by copying its own algorithm can preserve a bug. Prefer a small hand-worked trace, domain invariant, or differently structured reference model with documented assumptions.

## Maintain the learning pack

Every substantive chapter should have a source anchor, distinct exercise IDs, and separate review coverage. Links resolving is necessary but insufficient: a file can still exist after its semantics change. A maintainer should keep a claim register for consequential behaviors such as hidden-answer normalization, metadata versions, publication scope, and local-only demo saves.

When source behavior changes, update the current-behavior explanation and move old examples into a clearly historical incident only if they remain useful. Do not leave obsolete defects described in present tense. If a proposed feature becomes implemented, replace speculative language with exact source and verification references while retaining limitations.

Preserve learner answers and existing starter material. New reference solutions should remain separate, and a changed exercise should explain whether earlier answers still apply to an older version. The course is a workspace for learning, not a reason to overwrite personal work in order to make an automated check green.

## Exercises

**FF-47A, eight points:** Create a responsibility map for one proposed feature across core, data, API, and web. Identify two representations that must remain distinct and one accidental duplicate source of truth to resolve.

**FF-47B, six points:** Write a decision record for publication policy, export snapshot policy, or reconciliation. Include a concrete trigger, chosen behavior, storage/UI consequences, and the smallest meaningful evidence package.

**FF-47C, six points:** Build a claim register and review checklist for the learning pack. Include semantic link review, exercise coverage, preservation of learner work, and one counterexample that should remain a regression fixture after implementation.

## Exit evidence

A maintainable architecture makes responsibility visible. A maintainable course makes its claims and evidence visible. The same discipline supports both: define meanings, assign owners, preserve boundaries, and update the explanation when the implementation changes.
