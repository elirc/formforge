import type { FormSchema } from "./schema.js";
import type { AnswerValue } from "./validation.js";

export type ComparisonRule = Readonly<{
  kind: "equals" | "notEquals";
  fieldId: string;
  value: AnswerValue;
}>;

export type ConditionRule = ComparisonRule | Readonly<{
  kind: "all" | "any";
  conditions: readonly ConditionRule[];
}>;

export type VisibilityRule = Readonly<{
  targetFieldId: string;
  when: ConditionRule;
}>;

export type RuleIssue = Readonly<{
  targetFieldId: string;
  code: "target.missing" | "dependency.missing" | "dependency.self" | "dependency.cycle" | "target.duplicate";
  message: string;
}>;

export function evaluateRule(rule: ConditionRule, answers: Readonly<Record<string, AnswerValue | undefined>>): boolean {
  switch (rule.kind) {
    case "equals": return answers[rule.fieldId] === rule.value;
    case "notEquals": return answers[rule.fieldId] !== rule.value;
    case "all": return rule.conditions.every((condition) => evaluateRule(condition, answers));
    case "any": return rule.conditions.some((condition) => evaluateRule(condition, answers));
  }
}

function dependencies(rule: ConditionRule): readonly string[] {
  return "fieldId" in rule
    ? [rule.fieldId]
    : rule.conditions.flatMap(dependencies);
}

export function validateVisibilityRules(schema: FormSchema, rules: readonly VisibilityRule[]): readonly RuleIssue[] {
  const fieldIds = new Set(schema.fields.map((field) => field.id));
  const targets = new Set<string>();
  const issues: RuleIssue[] = [];

  for (const rule of rules) {
    if (!fieldIds.has(rule.targetFieldId)) issues.push({ targetFieldId: rule.targetFieldId, code: "target.missing", message: "The field controlled by this rule does not exist." });
    if (targets.has(rule.targetFieldId)) issues.push({ targetFieldId: rule.targetFieldId, code: "target.duplicate", message: "A field can have only one visibility rule." });
    targets.add(rule.targetFieldId);
    for (const dependency of new Set(dependencies(rule.when))) {
      if (!fieldIds.has(dependency)) issues.push({ targetFieldId: rule.targetFieldId, code: "dependency.missing", message: `Dependency ${dependency} does not exist.` });
      if (dependency === rule.targetFieldId) issues.push({ targetFieldId: rule.targetFieldId, code: "dependency.self", message: "A field cannot control its own visibility." });
    }
  }
  const controlledFields = new Set(rules.map((rule) => rule.targetFieldId));
  const graph = new Map(rules.map((rule) => [rule.targetFieldId, [...new Set(dependencies(rule.when))].filter((dependency) => dependency !== rule.targetFieldId && controlledFields.has(dependency))]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const path: string[] = [];
  const cyclic = new Set<string>();
  function visit(fieldId: string) {
    if (visiting.has(fieldId)) {
      const cycleStart = path.indexOf(fieldId);
      for (const cycleField of path.slice(cycleStart)) cyclic.add(cycleField);
      return;
    }
    if (visited.has(fieldId)) return;
    visiting.add(fieldId);
    path.push(fieldId);
    for (const dependency of graph.get(fieldId) ?? []) visit(dependency);
    path.pop();
    visiting.delete(fieldId);
    visited.add(fieldId);
  }
  for (const fieldId of graph.keys()) visit(fieldId);
  for (const targetFieldId of cyclic) issues.push({ targetFieldId, code: "dependency.cycle", message: "Conditional fields cannot depend on one another in a cycle." });
  return issues;
}

export function isFieldVisible(fieldId: string, rules: readonly VisibilityRule[], answers: Readonly<Record<string, AnswerValue | undefined>>): boolean {
  const rule = rules.find((candidate) => candidate.targetFieldId === fieldId);
  return rule ? evaluateRule(rule.when, answers) : true;
}

export const demoVisibilityRules: readonly VisibilityRule[] = [
  { targetFieldId: "consent", when: { kind: "equals", fieldId: "role", value: "engineering" } },
];
