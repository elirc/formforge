import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseFormSchema } from "./schema.js";

describe("form schema boundary", () => {
  it("parses every supported field through its discriminant", () => {
    const parsed = parseFormSchema({ id: "f", title: "Survey", fields: [
      { id: "t", kind: "text", label: "Text" },
      { id: "e", kind: "email", label: "Email" },
      { id: "n", kind: "number", label: "Number" },
      { id: "c", kind: "choice", label: "Choice", options: [{ id: "a", label: "A" }] },
      { id: "x", kind: "checkbox", label: "Consent", consentLabel: "I agree" },
      { id: "d", kind: "date", label: "Date" },
      { id: "h", kind: "content", label: "Heading", body: "Context" },
    ] });

    expect(parsed.fields.map((field) => field.kind)).toEqual(["text", "email", "number", "choice", "checkbox", "date", "content"]);
  });

  it("rejects invalid variant-specific data", () => {
    expect(() => parseFormSchema({ id: "f", title: "Survey", fields: [{ id: "c", kind: "choice", label: "Choice", options: [] }] })).toThrow();
  });

  it("round trips generated text fields through JSON and the runtime parser", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 40 }), (label) => {
      const input = { id: "f", title: "Generated", fields: [{ id: "field", kind: "text", label }] };
      expect(parseFormSchema(JSON.parse(JSON.stringify(input))).fields[0]?.label).toBe(label);
    }));
  });
});
