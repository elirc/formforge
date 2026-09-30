# 08. Rule values and dependency graphs answer different questions

Conditional visibility has two separate problems: evaluating a rule for a response and validating whether the rule configuration is structurally acceptable. FormForge implements both in [rules.ts](../../packages/core/src/rules.ts). Reading only evaluateRule can miss cycles and missing fields. Reading only the graph validator can miss the actual truth values produced by absent answers.

## Strict equality preserves value distinctions

Comparison rules use strict equality or strict inequality between answers[fieldId] and rule.value. A missing answer is undefined. It is not the same as false, an empty string, or the string false. An equals rule for false is therefore false when the answer is absent and true when the stored value is boolean false. A notEquals rule for engineering is true for an absent answer because undefined is not that string.

That last result can affect default visibility before the user answers anything. Do not import the validation helper's empty semantics into this evaluator. validateResponse treats false and trimmed-empty strings as empty for required checks, while evaluateRule compares raw values. The two functions serve different contracts, and a course should expose their interaction rather than pretending there is one universal meaning of missing.

all recursively evaluates every condition; any recursively evaluates some condition. An empty all is true under Array.every, while an empty any is false under Array.some. These are concrete identity cases, not parser validation results. The rule type can represent empty condition arrays, and the evaluator handles them according to those methods.

## Dependencies describe references, not outcomes

The private dependencies function walks a condition tree and returns every referenced field id. Validation then uses a set to avoid repeating a dependency issue for multiple references within one rule. Whether a branch would be false for today's answers does not erase its structural dependency. A hidden cycle is still a cycle in configuration even if one current response avoids traversing a particular truth path.

For each visibility rule, validation checks target existence, duplicate target, dependency existence, and self-reference. It collects issues rather than stopping at the first one. A fixture can therefore produce multiple issue codes. Tests should identify which set of issues is expected and avoid assuming a single exception stops the operation.

A self-reference is reported separately and is excluded from the graph edges used by the later cycle pass. This means a self-dependent field receives dependency.self through the explicit check rather than necessarily receiving dependency.cycle from the graph. A learner who treats every graph-theory cycle as the same emitted issue code would misread the implementation's chosen diagnostics.

## Build the controlled-field graph

The graph maps each controlled target to its dependencies that are also controlled targets, excluding itself. A field used as an ordinary input but without its own visibility rule does not become a node requiring traversal in this graph. It can still be a valid dependency; it simply cannot continue a chain of visibility control through another rule.

Work targets A, B, and C where A depends on B, B depends on C, and C depends on A. Starting at A, the depth-first traversal marks A visiting and pushes it on path, then B, then C. Revisiting A finds it in visiting. The code finds A's position in path and adds that suffix to the cyclic set. All three receive cycle issues after traversal.

Now add D depending on A. D reaches a cycle but is not itself necessarily in the cycle's path suffix. The validator's cyclic set describes members of detected cycles, not every node transitively affected by one. A UI might later display an additional affected-by-cycle warning, but that would be a proposed diagnostic with a different meaning.

## Visiting and visited are not interchangeable

visiting means currently on the active recursion path. visited means traversal of that node has completed. Encountering a visiting node detects a back edge; encountering an already visited node avoids repeated work. Replacing both sets with a single seen set can either miss cycles or incorrectly call a shared dependency a cycle.

Use a diamond-shaped acyclic graph: A depends on B and C, and both depend on D. D is reached twice through different completed paths. That should not be reported as a cycle merely because its id has appeared before. This is a better regression than a long simple chain, because the wrong one-set algorithm can pass chains while failing shared subgraphs.

The current code uses recursion. Very deep untrusted rule trees or dependency graphs raise resource-bound questions beyond ordinary examples. A future API parser needs size and depth policies if it accepts arbitrary externally supplied rule configurations. The existence of a correct small-graph DFS does not establish resistance to every oversized input.

## Duplicate target rules are already invalid

The validator reports target.duplicate. Its graph is constructed from a Map over rule targets, while isFieldVisible later uses find to select the first matching target rule. With duplicate targets, those mechanisms need not select the same rule occurrence for every purpose. The correct teaching conclusion is to validate and handle invalid configuration before relying on evaluation, not to bless an arbitrary duplicate policy as a feature.

A proposed service should decide what happens when validation returns issues. Refusing publication may be reasonable, but this module alone does not prove the existing publication route invokes visibility validation. Check actual callers before making an integration claim. Pure functions can be well designed and still not be wired into the HTTP operation you have in mind.

## Independent practice

**FF-08A, eight points:** Produce a truth table for missing, false, empty string, and engineering under equals and notEquals rules. Add empty all and any cases. Explain why required-answer validation cannot substitute for this table.

**FF-08B, six points:** Trace visiting, visited, path, and cyclic for a three-node cycle and a diamond DAG. State which nodes receive cycle issues and which merely depend on them.

**FF-08C, six points:** Design configuration fixtures for missing target, missing dependency, self-reference, and duplicate target. Propose an integration boundary that rejects issues before evaluation, while clearly marking that wiring as learner work.

Use [the separate pure-core review](review-03-builder-and-rule-graphs.md) after your own attempt. The [course index](README.md) records subsequent modules as they are added.
