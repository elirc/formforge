# 26. Schema evolution and response interpretation

Published schemas provide a historical interpretation for submitted answers. Field IDs, choice IDs, labels, and types each contribute differently to that interpretation. This chapter uses [schema.ts](../../packages/core/src/schema.ts), [publications.ts](../../packages/data/src/publications.ts), [submissions.ts](../../packages/data/src/submissions.ts), and the response helpers in [responses.ts](../../packages/core/src/responses.ts) to design a proposed evolution policy. The [review](review-09-durable-repository-contracts.md) contains the answer guide.

## Identity carries meaning over time

A field ID is more than a convenient object key once responses exist. It connects an answer to a question in a particular schema. Changing a label can be a harmless clarification or a substantive change in meaning. Reusing the same ID for a different question can make aggregated historical data misleading even if every response still parses.

Consider a field called budget whose label changes from monthly budget to annual budget. Keeping the same ID and numeric representation does not make the values directly comparable. A response of 1000 has a different interpretation under the two publications. The publication snapshot can preserve that distinction, but an analytics query that groups only by field ID can erase it.

The evolution policy should define when a new field ID is required and when a label-only revision is acceptable. This is partly a domain decision. The technical system can preserve snapshots and provenance, but it cannot infer that two differently worded questions measure the same concept. A review workflow should ask that question explicitly before merging analytics across versions.

## Choice IDs and labels

Choice answers store option IDs, while labels are presentation text in the schema. Renaming a label can preserve the option's identity if its meaning is unchanged. Reusing an old option ID for a new meaning can corrupt interpretation. Deleting an option from a new publication should not make the old publication's responses unreadable; historical rendering should consult the old snapshot.

The current schema validator checks duplicate normalized option labels in a choice field, but it does not establish every possible option-ID uniqueness invariant discussed in earlier chapters. A proposed publication gate should validate the identity rules needed by response interpretation. Two options with the same ID cannot be distinguished reliably in answers even if their labels differ.

For reporting across versions, create an explicit mapping only when the domain supports it. For example, an old option engineering and a new option software may be declared equivalent for one report, while a split into frontend and backend requires a different treatment. Do not silently distribute an old broad answer across new categories or assume a renamed label proves equivalence. Keep the original answer and publication reference available.

## Type changes require a migration decision

Changing a text field to number under the same ID can leave old answers that fail the new validator. Changing a checkbox to choice changes the value type and possible meanings. A current form renderer should use the publication it is rendering, while historical analytics should not validate every old response against the latest schema and discard failures as corrupt data.

A proposed migration can transform historical answers only when the transformation is defined and evidence is retained. Converting a numeric string to a number may lose formatting such as leading zeros, which can matter if the field actually represented an identifier. Converting false to an option ID requires a semantic mapping, not merely a type cast. When meaning cannot be recovered, represent unknown or unmapped explicitly.

The current AnswerValue permits string or boolean, and the repository stores a clone of the answer object. It does not contain a historical migration engine. A course exercise should therefore design mappings on synthetic copies and record original values separately. Do not alter stored response fixtures merely to make them fit a new schema in an example.

## Requiredness and denominators

A field becoming required changes the expected completeness of new responses, but it does not retroactively make older optional omissions invalid. Analytics should distinguish not asked, asked but skipped, hidden by logic, and answered empty if the data model records those differences. The current renderer's normalization can collapse some of those states, so a proposed richer analytics contract may need richer submission metadata.

Suppose version one did not contain a question and version two requires it. Dividing its answered count by all responses across both versions understates completion for respondents who were actually asked. Conversely, excluding every empty value without tracking eligibility can overstate response rate. Define the denominator from the question's exposure or schema eligibility, not from whichever rows happen to contain a truthy value.

This connects schema evolution to the existing analytics chapter. A mathematically correct percentage can still answer the wrong question if versions and eligibility are mixed. The report should state its population, publication range, mapping policy, and treatment of missingness. These are analytical contracts, not cosmetic labels added after a query is written.

## Exporting historical data

The response CSV helper accepts field IDs supplied by its caller. It does not automatically join each response to the publication snapshot or generate a cross-version schema. A production export must choose columns and labels deliberately. Using only latest labels can misdescribe old answers; using only field IDs can preserve technical identity while leaving humans without enough context.

A proposed export can include publication ID or version, stable field ID, historical label metadata in a companion schema file, and explicit mapping notes for combined columns. A wide spreadsheet may be convenient, but it should not conceal that one column aggregates different question versions. For regulated or audit-oriented use, a normalized export with response, publication, field, and value records may preserve provenance more clearly, though it is less immediately readable.

The CSV formula-escape behavior remains a separate output concern. Correct quoting does not solve semantic mislabeling, and correct historical labels do not establish spreadsheet safety in every consumer. Keep representation safety and data interpretation as independent review dimensions.

## A compatibility matrix laboratory

Construct six proposed schema changes: label clarification, unit change, optional-to-required, option rename with stable meaning, option-ID reuse with new meaning, and field type change. For each, state whether the old publication remains renderable, whether old responses remain valid under their original schema, whether cross-version aggregation is allowed, and whether a new field or option identity is required.

Then create a report question such as how many respondents selected a technical role this quarter. Explain which publications are included and how each version's options map to technical. If a mapping is ambiguous, exclude it with a visible limitation or report it separately. Do not force a clean number by silently guessing.

This laboratory can be completed with tables and synthetic examples. It does not require a database migration or changing application source. Its output is a compatibility policy that future code can implement and tests can verify. The policy should be reviewed by someone who understands the form's domain, because technical type compatibility alone cannot establish semantic continuity.

## Exercises

**FF-26A, eight points:** Complete the six-change compatibility matrix. Distinguish field identity, option identity, label, and unit, and explain one change that is type-compatible but semantically incompatible.

**FF-26B, six points:** Design a historical response-rate report across an optional and required version. Define eligibility, missingness, publication scope, and the data needed to avoid treating not asked as skipped.

**FF-26C, six points:** Propose a cross-version export and mapping manifest. Preserve original answers and publication provenance, handle one ambiguous option mapping honestly, and separate CSV output safety from semantic correctness.

## Exit evidence

The goal is to preserve meaning, not merely keep old JSON parseable. A robust evolution policy can explain every historical answer using the schema that produced it and can justify any later aggregation. If a report cannot identify that interpretation, its precision is cosmetic even when its arithmetic is exact.
