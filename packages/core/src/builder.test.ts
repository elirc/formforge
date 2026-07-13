import { describe, expect, it } from "vitest";
import { builderReducer, createField, initialBuilderState } from "./builder.js";

describe("builder reducer", () => {
  it("adds and selects a new typed field", () => {
    const field = createField("date", "start-date");
    const next = builderReducer(initialBuilderState, { type: "field.add", field });
    expect(next.schema.fields.at(-1)).toEqual(field);
    expect(next.selectedFieldId).toBe("start-date");
  });

  it("duplicates with new identity without mutating the source", () => {
    const source = initialBuilderState.schema.fields[0];
    if (!source) throw new Error("fixture requires a field");
    const next = builderReducer(initialBuilderState, { type: "field.duplicate", fieldId: source.id, newId: "copy" });
    expect(next.schema.fields[0]?.id).toBe(source.id);
    expect(next.schema.fields[1]).toMatchObject({ id: "copy", label: `${source.label} copy` });
  });

  it("moves selection to a remaining field after removal", () => {
    const selected = initialBuilderState.selectedFieldId;
    if (!selected) throw new Error("fixture requires a selection");
    const next = builderReducer(initialBuilderState, { type: "field.remove", fieldId: selected });
    expect(next.schema.fields.some((field) => field.id === selected)).toBe(false);
    expect(next.selectedFieldId).toBe(next.schema.fields[0]?.id);
  });

  it("reorders without changing field identity or selection", () => {
    const beforeIds = initialBuilderState.schema.fields.map((field) => field.id);
    const moving = beforeIds[2];
    if (!moving) throw new Error("fixture requires three fields");

    const next = builderReducer(initialBuilderState, { type: "field.move", fieldId: moving, targetIndex: 0 });

    expect(next.schema.fields[0]?.id).toBe(moving);
    expect([...next.schema.fields.map((field) => field.id)].sort()).toEqual([...beforeIds].sort());
    expect(next.selectedFieldId).toBe(initialBuilderState.selectedFieldId);
  });
});
