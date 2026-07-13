import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { demoResponses, escapeCsvCell, exportResponsesCsv, queryResponses } from "./responses.js";

describe("response querying and export", () => {
  it("paginates a stable composite ordering without gaps", () => {
    const first = queryResponses(demoResponses, { sort: "newest", limit: 5 });
    if (!first.nextCursor) throw new Error("expected another response page");
    const second = queryResponses(demoResponses, { sort: "newest", limit: 5, cursor: first.nextCursor });

    expect(first.items).toHaveLength(5);
    expect(second.items).toHaveLength(5);
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(10);
    expect(first.items[0]?.id).toBe("response-018");
  });

  it("filters case-insensitively across answer values", () => {
    const page = queryResponses(demoResponses, { search: "GRACE", sort: "oldest", limit: 30 });
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((item) => item.answers.name === "Grace Hopper")).toBe(true);
  });

  it("escapes CSV delimiters, quotes, line breaks, and formula prefixes", () => {
    expect(escapeCsvCell('Ada, "Countess"\nLondon')).toBe('"Ada, ""Countess""\nLondon"');
    expect(escapeCsvCell("=2+2")).toBe("'=2+2");
    expect(exportResponsesCsv([{ id: "r1", submittedAt: "now", answers: { note: "a,b" } }], ["note"])).toContain('"a,b"');
  });

  it("never leaves a bare quote inside generated CSV cells", () => {
    fc.assert(fc.property(fc.string(), (value) => {
      const escaped = escapeCsvCell(value);
      if (value.includes('"')) {
        expect(escaped.startsWith('"') && escaped.endsWith('"')).toBe(true);
        expect(escaped.slice(1, -1).replaceAll('""', "")).not.toContain('"');
      }
    }));
  });
});
