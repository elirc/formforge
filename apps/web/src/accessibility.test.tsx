import { demoForm, demoFormFlow, demoJourneys, demoResponses } from "@formforge/core";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { AnalyticsDashboard } from "./AnalyticsDashboard.js";
import { FormRenderer } from "./FormRenderer.js";
import { ResponseExplorer } from "./ResponseExplorer.js";

describe("automated accessibility smoke audit", () => {
  it("finds no detectable violations in representative product surfaces", async () => {
    const { container } = render(<main><FormRenderer schema={demoForm} /><ResponseExplorer responses={demoResponses} /><AnalyticsDashboard journeys={demoJourneys} responses={demoResponses} pages={demoFormFlow.pages} /></main>);
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  }, 15_000);
});
