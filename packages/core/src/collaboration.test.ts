import { describe, expect, it } from "vitest";
import { demoForm, type FormSchema } from "./schema.js";
import { diffFormSchemas, parseMentions } from "./collaboration.js";

describe("collaboration domain", () => {
  it("parses unique normalized mentions without treating email addresses as mentions", () => {
    expect(parseMentions("Review with @Ada and @GRACE, then email dev@example.com. @ada")).toEqual(["ada", "grace"]);
  });

  it("describes form, field addition, removal, and property changes by stable identity", () => {
    const name = demoForm.fields.find((field) => field.id === "name");
    if (!name || name.kind !== "text") throw new Error("demo name field missing");
    const after: FormSchema = {
      ...demoForm,
      title: "Research intake",
      fields: [
        { ...name, label: "Full name", required: false },
        ...demoForm.fields.slice(2),
        { id: "notes", kind: "text" as const, label: "Notes", description: "", required: false, placeholder: "", maxLength: 500 },
      ],
    };
    const changes = diffFormSchemas(demoForm, after);
    expect(changes.map((change) => change.kind)).toEqual(["form.renamed", "field.removed", "field.updated", "field.added"]);
    expect(changes.find((change) => change.fieldId === "name")?.summary).toContain("label, required");
  });

  it("returns no noise for identical snapshots", () => {
    expect(diffFormSchemas(demoForm, structuredClone(demoForm))).toEqual([]);
  });
});
