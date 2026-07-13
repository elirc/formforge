import { demoFormFlow, demoJourneys, demoResponses } from "@formforge/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalyticsDashboard } from "./AnalyticsDashboard.js";

describe("analytics dashboard", () => {
  it("names metric denominators and pairs visual charts with exact tables", () => {
    render(<AnalyticsDashboard journeys={demoJourneys} responses={demoResponses} pages={demoFormFlow.pages} />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("18 of 24 starts")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Exact page drop-off values" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Exact role response values" })).toBeInTheDocument();
  });

  it("uses a deliberate empty state instead of dividing by zero", () => {
    render(<AnalyticsDashboard journeys={[]} responses={[]} pages={demoFormFlow.pages} />);
    expect(screen.getByRole("heading", { name: "No journeys yet" })).toBeInTheDocument();
  });
});
