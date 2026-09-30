# 44. Incident clinic: from symptom to boundary

This clinic combines several real source boundaries into four synthetic incidents. The goal is to practice diagnosis without changing runtime code or treating the first plausible explanation as proven. Use [useAutosave.tsx](../../apps/web/src/useAutosave.tsx), [FormRenderer.tsx](../../apps/web/src/FormRenderer.tsx), [app.ts](../../apps/api/src/app.ts), and [AnalyticsDashboard.tsx](../../apps/web/src/AnalyticsDashboard.tsx). Review guidance is in [the operational capstone guide](review-14-operational-capstones.md).

## Incident one: the draft says saved, but my latest edit is missing

Begin with the exact UI statement and its owner. The autosave hook distinguishes latest request identity from committed server version, while the current demo save callback does not persist the supplied schema to the API. A report from the demo can therefore have a different explanation from a report after a real adapter is connected. First establish which path the running screen uses.

Next reconstruct edit, debounce, queue start, request completion, and later edit times. An older successful save can legitimately advance the committed version while not marking the newest local edit saved. If the UI status is derived from the wrong request identity, it can overstate freshness. If the schema never reached a durable adapter, a successful local callback is not evidence of server persistence.

Collect a synthetic reproduction with distinct schema titles for each edit, request IDs, and returned versions. Avoid recording real form content in routine diagnostics. The next useful check is the authoritative draft read and the client ledger, not repeatedly clicking Save until the symptom disappears. Repeated retries can obscure the original ordering.

## Incident two: a hidden required question blocks me

The renderer validates only visibleFields at submit, so an already hidden required field should not produce a new validation error in that path. But errors from an earlier submission can remain while a later answer hides the field. The summary's outer condition uses all stored errors while its links use visible fields. These are different schedules.

Ask whether the field was visible during the last submit and whether the respondent submitted again after hiding it. Inspect the current answers used for visibility, the stored errors, and the callback payload separately. A stale error message does not necessarily mean the current submission validator still includes the hidden field. Conversely, a successful visible-only preview does not establish the server uses the same conditional policy.

The reproduction should perform reveal, invalid submit, hide, and resubmit with explicit observations after each step. If the server rejects a hidden field after the preview accepts it, compare the published rule contract and server validation path. Do not fix the symptom by disabling all required validation; that would cross the wrong boundary.

## Incident three: one response appears twice after republishing

The respondent reused an idempotency key, so the team assumes duplication is impossible. Trace the publication ID used by each attempt. The current route resolves the slug anew, and the repository scopes the key by publication. P1/K and P2/K are different operations under that implementation. A republish between attempts can therefore explain two stored records without any failure in the Map's duplicate lookup.

The next evidence is the two submission publication IDs, their schema snapshots, and the route timeline. Do not merge or delete records based only on matching answers; two legitimate respondents can submit identical values. A recovery policy must identify the logical attempt through stronger evidence before deduplicating historical data.

The long-term fix belongs in the respondent publication-binding and retry contract. Adding a global unique key without considering key generation scope could suppress legitimate submissions across forms or users. The incident teaches that deduplication is only as meaningful as the identity boundary it protects.

## Incident four: completion rate looks good but median time looks wrong

The report counts completedAt being defined as completion, but excludes invalid or negative durations from the median. The UI formats seconds with a remainder that can round to sixty. A suspicious display may therefore involve input quality, analytical eligibility, presentation rounding, or all three.

Inspect raw synthetic journey timestamps, the eligible duration list, the computed median, and the formatted text as separate evidence. A value displayed as one minute sixty seconds can arise from the formatter even when the median is numerically valid. A high completion count with few eligible durations can arise from invalid timestamps without changing the completion predicate.

The appropriate correction depends on the boundary. Fixing display normalization does not repair missing telemetry. Rejecting invalid duration samples does not explain why they were produced. Changing the completion definition to hide bad timestamps can distort conversion reporting. Preserve the original metrics and add data-quality evidence before choosing a product change.

## An evidence ladder

For each incident, write four sections: observed symptom, source-supported hypotheses, discriminating evidence, and bounded next experiment. A hypothesis is useful when a specific observation could make it less likely. Statements such as the system is flaky do not guide an experiment. Statements such as the retry resolved a different publication ID do.

Use the smallest reproduction that preserves the boundary. Two edits can expose stale save status; one conditional field can expose error lifetime; two publications can expose replay scope; two duration samples can expose rounding or median eligibility. Small synthetic fixtures reduce the chance of leaking respondent data and make the causal sequence reviewable.

When evidence remains incomplete, report uncertainty precisely. The draft outcome may be unknown, the hidden error may be stale, the two submissions may or may not represent one logical attempt, and the duration issue may be presentation-only. These are useful conclusions when paired with a clear next check. False certainty can lead to destructive cleanup or unsafe retries.

## Repair and verification

A repair should target the established boundary and include a regression scenario that would fail under the old behavior. If changing autosave status, preserve committed-version advancement for superseded successes. If changing error cleanup, preserve required validation for currently visible fields. If binding submissions to publications, preserve legitimate new response attempts. If normalizing duration text, preserve the core median definition.

After a focused check passes, broaden verification only when shared assumptions changed or new failures appear. Do not use a large green test count to avoid explaining the actual reproduction. The handoff should state the before/after behavior, exact evidence, and remaining limits. No code change is required to complete this written clinic, but the plan should be concrete enough for another engineer to implement safely.

## Exercises

**FF-44A, eight points:** Build evidence ladders for the save-status and hidden-question incidents. Include two competing hypotheses for each and the smallest observation that distinguishes them.

**FF-44B, six points:** Diagnose the republish duplicate and analytics incidents without deleting records or redefining metrics prematurely. Name the authoritative identities and intermediate representations to inspect.

**FF-44C, six points:** Choose one incident and write a focused repair/verification brief. Preserve one adjacent invariant and state the uncertainty that remains after the proposed test passes.

## Exit evidence

The clinic is complete when the learner can move from a user symptom to a named boundary without skipping evidence. The same visible symptom can have different causes, and the same underlying effect can produce different messages. A good investigation keeps those possibilities separate until observations justify a narrower conclusion.
