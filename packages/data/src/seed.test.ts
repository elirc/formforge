import { describe, expect, it } from "vitest";
import { createSeedDataset } from "./seed.js";

describe("release seed", () => {
  it("produces byte-for-byte repeatable demo data", () => {
    expect(JSON.stringify(createSeedDataset())).toBe(JSON.stringify(createSeedDataset()));
  });

  it("returns isolated data so one run cannot contaminate another", () => {
    const first = createSeedDataset();
    const second = createSeedDataset();
    (first.workspace.forms[0] as { title: string }).title = "Mutated locally";

    expect(second.workspace.forms[0]?.title).toBe("Customer research");
    expect(second.responses).toHaveLength(18);
    expect(second.comments).toHaveLength(1);
  });
});
