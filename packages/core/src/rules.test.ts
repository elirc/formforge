import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { demoForm } from "./schema.js";
import { evaluateRule, isFieldVisible, validateVisibilityRules, type ConditionRule } from "./rules.js";

describe("conditional visibility rules", () => {
  it("evaluates nested all and any groups exhaustively", () => {
    const rule: ConditionRule = {
      kind: "all",
      conditions: [
        { kind: "equals", fieldId: "role", value: "engineering" },
        { kind: "any", conditions: [{ kind: "equals", fieldId: "region", value: "west" }, { kind: "equals", fieldId: "region", value: "east" }] },
      ],
    };

    expect(evaluateRule(rule, { role: "engineering", region: "west" })).toBe(true);
    expect(evaluateRule(rule, { role: "design", region: "west" })).toBe(false);
    expect(evaluateRule(rule, { role: "engineering", region: "south" })).toBe(false);
  });

  it("makes equality behavior explicit across generated respondent values", () => {
    fc.assert(fc.property(fc.string(), (value) => {
      expect(evaluateRule({ kind: "equals", fieldId: "role", value: "engineering" }, { role: value })).toBe(value === "engineering");
    }));
  });

  it("defaults fields to visible and evaluates the matching target rule", () => {
    const rules = [{ targetFieldId: "consent", when: { kind: "equals" as const, fieldId: "role", value: "engineering" } }];
    expect(isFieldVisible("name", rules, {})).toBe(true);
    expect(isFieldVisible("consent", rules, { role: "design" })).toBe(false);
    expect(isFieldVisible("consent", rules, { role: "engineering" })).toBe(true);
  });

  it("reports missing references, duplicate targets, and direct self-dependency", () => {
    const issues = validateVisibilityRules(demoForm, [
      { targetFieldId: "consent", when: { kind: "equals", fieldId: "consent", value: true } },
      { targetFieldId: "consent", when: { kind: "equals", fieldId: "missing", value: "yes" } },
      { targetFieldId: "ghost", when: { kind: "equals", fieldId: "role", value: "engineering" } },
    ]);
    expect(issues.map((issue) => issue.code)).toEqual(["dependency.self", "target.duplicate", "dependency.missing", "target.missing"]);
  });
});
