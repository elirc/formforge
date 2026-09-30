# 34. Flow graph validation and branch priority

The core flow functions implement navigation but do not expose a complete static flow validator. This chapter designs one as a proposal while preserving the current runtime semantics in [flow.ts](../../packages/core/src/flow.ts) and condition evaluation in [rules.ts](../../packages/core/src/rules.ts). The aim is to distinguish structural validity, reachability, and respondent-dependent behavior. Answers are in the [workflow review](review-12-journeys-flows-and-query-snapshots.md).

## Branch order is behavior

nextSession finds the first branch whose fromPageId matches the current page and whose condition evaluates true. If no branch matches, it follows the next page in array order or completes at the end. Therefore, reordering branches can change navigation when more than one condition is true. The array is an ordered decision list, not an unordered set of edges.

Create a page with two branches: one for role not equal to design leading to review, and one for role equal to engineering leading to technical. Engineering satisfies both, so the first branch wins. Swapping their order changes the destination. A validator that merely checks both target pages exist will not detect the semantic priority question.

A proposed authoring UI can make priority visible and warn about overlapping conditions where it can establish overlap. Full logical overlap analysis may be difficult as the rule language grows, so the validator should distinguish proven overlap, possible overlap, and unchecked cases. Do not claim every unreachable branch can be detected with a simple graph traversal; conditions affect feasibility.

## Structural checks before execution

A static validator can reject an empty page list, duplicate page IDs, branch sources or targets that do not exist, and field references absent from the schema. It can also decide whether a field may appear on multiple pages and whether unassigned fields are allowed. These are policy decisions that the current type definitions alone do not enforce at runtime.

The renderer builds pageSchema by filtering schema.fields for membership in page.fieldIds. This preserves schema order rather than the order written in the page's fieldIds array. A flow author expecting page-local ordering can therefore be surprised. A proposed contract should either declare schema order authoritative or explicitly map fieldIds in page order with duplicate/missing checks.

Duplicate page IDs create further ambiguity because nextSession uses findIndex and existence checks, while navigation history stores only IDs. The validator should reject them before a respondent session is created. Attempting to repair duplicates during navigation cannot reliably identify which page the author intended.

## Reachability has two levels

A graph that includes every possible branch and fallback edge can identify pages with no structural path from the first page. That is a useful conservative check. But a structurally reachable page may still be impossible under all valid answer combinations, and a graph cycle may be unreachable because its conditions cannot be satisfied together.

For a small finite choice domain, a teaching validator can enumerate answer combinations and simulate the ordered decision list. For unrestricted text or numeric conditions, exhaustive enumeration is not generally available. The proposal should state its analysis bounds and use warnings rather than false proofs where necessary.

Also distinguish reachability from termination. A reachable cycle can permit an endless path, but whether the respondent can leave it depends on conditions and answer changes. The current nextSession appends visited pages and does not impose a maximum navigation length. A production flow may forbid cycles, allow explicit review loops, or cap repeated transitions. Each policy needs a clear respondent experience when a loop is detected.

## Backtracking changes the answer environment

backSession removes the last visited page and restores the previous one while retaining answers. A respondent can change an earlier answer and then take a different branch. The retained answers from the abandoned branch remain in the session unless another policy clears them. That is useful for preserving work if the respondent returns, but final submission eligibility must not accidentally treat every retained answer as currently applicable.

Consider contact, role, technical, review. The respondent first chooses engineering and answers technical questions, then goes back and chooses design, which skips technical. The flow history now follows a different route, but technical answers can remain. A proposed final collector should decide whether to omit answers from pages no longer on the effective path, preserve them as inactive draft data, or include them with eligibility metadata.

Do not delete abandoned answers immediately without considering reversibility. A respondent may correct an accidental branch choice and expect prior work to reappear. A useful design separates retained draft answers from final eligible answers, echoing the renderer's visibility/serialization distinction. The validator and session model should support that separation rather than relying on UI disappearance to erase data.

## Progress is not remaining work

The multi-page UI displays array position plus one out of total pages. Branches can skip pages or complete early, so this is not necessarily the number of steps the respondent will actually take. A branch to null can finish on a page whose button still says Continue because the label is based on array position. These are current presentation choices, not proof that the navigation engine chose the wrong destination.

A proposed progress design can show section position, estimated remaining steps, or completed visited sections. Each has limitations when future answers change the path. Avoid promising a precise remaining count before the branch conditions are known. The interface can say step two in the form structure or use a less numeric progress indicator if that better matches the flow contract.

## Exercises

**FF-34A, eight points:** Work the overlapping role-branch example before and after reordering. Define structural validation rules and explain why branch priority and field ordering must be explicit.

**FF-34B, six points:** Distinguish structural reachability, condition-feasible reachability, and termination. Propose an analysis strategy for finite choice fields and state its limits for unrestricted answer domains.

**FF-34C, six points:** Trace backtracking from technical to a design branch. Define retained draft versus final eligible answers and propose progress wording that does not claim a known remaining path prematurely.

## Exit evidence

A validated flow is more than a collection of existing page IDs. It has ordered decisions, identity constraints, an answer-retention policy, and a declared treatment of loops. The learner should be able to explain both the graph and the conditions that make a particular respondent's path possible.
