import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { demoFormFlow } from "./flow.js";
import { demoResponses } from "./responses.js";
import { buildAnalyticsReport, choiceBreakdown, type ResponseJourney } from "./analytics.js";

describe("analytics semantics", () => {
  it("defines zero-denominator behavior for an empty report", () => {
    const report = buildAnalyticsReport([], demoFormFlow.pages);
    expect(report).toMatchObject({ started: 0, completed: 0, completionRate: 0, medianCompletionSeconds: null });
    expect(report.pageDropoff.every((page) => page.rate === 0)).toBe(true);
  });

  it("uses started journeys as the completion and drop-off denominator", () => {
    const journeys: readonly ResponseJourney[] = [
      { id: "1", startedAt: "2026-07-13T00:00:00Z", completedAt: "2026-07-13T00:01:00Z", lastPageId: "consent" },
      { id: "2", startedAt: "2026-07-13T00:00:00Z", completedAt: "2026-07-13T00:03:00Z", lastPageId: "consent" },
      { id: "3", startedAt: "2026-07-13T00:00:00Z", lastPageId: "role" },
      { id: "4", startedAt: "2026-07-13T00:00:00Z", lastPageId: "role" },
    ];
    const report = buildAnalyticsReport(journeys, demoFormFlow.pages);
    expect(report).toMatchObject({ started: 4, completed: 2, completionRate: 0.5, medianCompletionSeconds: 120 });
    expect(report.pageDropoff.find((page) => page.pageId === "role")).toMatchObject({ count: 2, rate: 0.5 });
  });

  it("reports choice shares over answered values", () => {
    const choices = choiceBreakdown(demoResponses, "role");
    expect(choices.reduce((sum, choice) => sum + choice.count, 0)).toBe(demoResponses.length);
    expect(choices.reduce((sum, choice) => sum + choice.rate, 0)).toBeCloseTo(1);
  });

  it("keeps completion rates within probability bounds for generated journeys", () => {
    fc.assert(fc.property(fc.array(fc.boolean()), (completions) => {
      const journeys = completions.map((complete, index): ResponseJourney => complete
        ? { id: String(index), startedAt: "2026-07-13T00:00:00Z", completedAt: "2026-07-13T00:00:01Z", lastPageId: "consent" }
        : { id: String(index), startedAt: "2026-07-13T00:00:00Z", lastPageId: "contact" });
      const rate = buildAnalyticsReport(journeys, demoFormFlow.pages).completionRate;
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }));
  });
});
