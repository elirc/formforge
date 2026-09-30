# 02. Parse, validate, and decide whether publication is allowed

A typed FormSchema is not the same as a publishable form. FormForge deliberately has a parser and a second validator. The separation lets a draft represent unfinished work while publication applies additional rules. It also gives reviewers a precise way to ask whether an invalid result came from shape, identity, or business constraints.

Read [schema.ts](../../packages/core/src/schema.ts), [validation.ts](../../packages/core/src/validation.ts), and the draft and publication handlers in [app.ts](../../apps/api/src/app.ts). Do not start by guessing what a form application ought to reject. First derive what these actual functions inspect.

## Parsing constructs a known shape

The parser uses a discriminated union keyed by kind. Text, email, number, choice, checkbox, date, and content fields have different properties. For example, text supplies a bounded positive maximum length, choice requires an array containing at least one option, and content requires required to be false. Shared description and required properties have defaults where the schema declares them.

A parser therefore does more than ask whether input is an object. It can produce a normalized typed result with defaults. The application should use that result, rather than validate the raw object and later persist a different value. In this route, schema is assigned from parseFormSchema and that assigned value is passed onward. This is a useful observation to preserve when introducing another adapter.

Some string checks are minimum-length checks rather than trimmed-content checks. A title containing spaces can satisfy the parser's nonempty string requirement while failing validateSchema's trimmed-title test. This is not a contradiction. The two functions establish different levels of readiness. The resulting teaching question is whether each caller invokes the correct level for its operation.

## Publication applies semantic rules

validateSchema checks that the trimmed title is nonempty, that there is at least one response field, that field ids are unique, and that labels contain nonwhitespace content. For number fields with both bounds present, minimum must not exceed maximum. Choice labels are compared after trimming and lowercasing, so two options labeled Blue and blue with surrounding spaces create a duplicate-label issue.

Notice what this list does not establish. The visible choice rule compares labels, not option ids. The date schema uses optional strings for earliest and latest, and this validator does not add a calendar parser or an earliest-before-latest rule. A reviewer can propose stronger constraints, but must not report them as already enforced merely because the types have suggestive names.

The draft route parses the form and checks route/body identity, then calls the draft repository. The publish route additionally calls validateSchema and returns a schema_not_publishable response with issues when any are present. Saving an unfinished but parseable form can therefore succeed while publishing it fails. A test that expects every draft save to apply every publication rule would be testing a newly invented contract.

## Rejection order affects observable behavior

The publish route compares x-workspace-id with the route workspace first. It then checks slug shape, parses schema, obtains semantic issues, checks form identity, and returns semantic issues if identity agrees. Only after those checks does it call the publication repository.

Use a fixture that violates both workspace and slug. The first result follows the workspace branch, not whichever message seems most helpful to a learner. Then make workspace agree while leaving slug invalid. This moves the first rejecting boundary. A rejection-order table helps isolate tests: when testing duplicate labels, the header, slug, parser shape, and schema id must all let the request reach semantic validation.

The header comparison is a demonstration check, not authenticated ownership. A caller can construct that header. Keep the distinction visible when writing exercises; otherwise students may learn that matching two caller-controlled strings proves authorization. A later authorization capstone should choose a trusted principal and define resource permissions explicitly.

## Responses use another validation path

The submission route's parseAnswers accepts a non-array object only when every value is a string or boolean. A numerical answer must therefore arrive as a string under the inspected API contract. validateResponse then visits schema fields and reads answers by field id. It does not use the same parser as form definitions.

The helper named empty treats undefined, false, and trimmed-empty strings as empty. A required checkbox with false rejects. An optional false value does not. After the required check, non-string values return without the string-specific email, number, choice, or date checks. That means true on a non-checkbox field deserves a characterization test: the current code does not automatically turn the broad AnswerValue union into a kind-specific runtime type rule.

This observation is a curriculum opportunity rather than a reason to edit production during reading. Write down the current result and a proposed stricter rule in separate columns. The stricter rule needs acceptance examples for each kind, a compatibility decision, and changes to both browser and API evidence if implemented.

## A focused debugging experiment

Suppose a tester says, A form with duplicate option labels saved successfully. Ask which operation they performed. If it was a draft save, reproduce the draft path and inspect its contract. If it was publication, verify the exact labels reaching validateSchema after parsing and ensure the request reached that branch. A bug report that omits the operation can misclassify intended incomplete-draft behavior as failed publication validation.

**FF-02A, eight points:** Construct one input that parses but cannot publish and one that fails parsing. Name the rule and expected route outcome. Keep workspace, slug, and identity valid so your experiment isolates the chosen boundary.

**FF-02B, six points:** Trace a required checkbox false, optional checkbox false, number string zero, and boolean true supplied to a required email field. Separate current observations from your recommended contract. Do not call a recommendation an executed regression.

**FF-02C, six points:** Design a test matrix for simultaneous invalid header, slug, identity, and semantic issues. Identify the first reached rejection and assert that publication storage is not invoked. Explain why four invalidities in one fixture do not independently test four guards.

Review your predictions in [the identity and validation guide](review-01-identity-and-validation.md), then move to [conditional drafts](03-conditional-drafts-and-defensive-copies.md).
