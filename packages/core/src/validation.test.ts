import { describe, expect, it } from "vitest";
import { demoForm, type FormSchema } from "./schema.js";
import { validateResponse, validateSchema } from "./validation.js";

describe("validation boundaries", () => {
  it("reports authoring problems before publish", () => {
    const invalid: FormSchema = { id: "f", title: " ", description: "", fields: [
      { id: "same", kind: "number", label: "Range", description: "", required: false, minimum: 10, maximum: 2 },
      { id: "same", kind: "choice", label: "Role", description: "", required: false, options: [{ id: "a", label: "One" }, { id: "b", label: "one" }] },
    ] };
    expect(validateSchema(invalid).map((issue) => issue.code)).toEqual(["title.empty", "number.range", "field.duplicate-id", "choice.duplicate"]);
  });

  it.each([
    [{}, { name: "This field is required.", email: "This field is required.", consent: "This field is required." }],
    [{ name: "Ada", email: "not-an-email", consent: true }, { email: "Enter a complete email address." }],
    [{ name: "Ada", email: "ada@example.com", role: "unknown", consent: true }, { role: "Select an available option." }],
    [{ name: "Ada", email: "ada@example.com", role: "engineering", consent: true }, {}],
  ])("validates respondent values %#", (answers, expected) => {
    expect(validateResponse(demoForm, answers)).toEqual(expected);
  });
});
