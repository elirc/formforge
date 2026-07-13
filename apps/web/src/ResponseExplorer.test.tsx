import { demoResponses } from "@formforge/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ResponseExplorer } from "./ResponseExplorer.js";

describe("response explorer", () => {
  it("filters and sorts responses through labelled controls", async () => {
    const user = userEvent.setup();
    render(<ResponseExplorer responses={demoResponses} />);

    await user.type(screen.getByRole("searchbox", { name: "Search responses" }), "Grace");
    expect(screen.getByRole("heading", { name: "5 responses" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6);
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort" }), "oldest");
    expect(within(screen.getAllByRole("row")[1]!).getByText("respondent2@example.com")).toBeInTheDocument();
  });

  it("loads stable pages and exposes a downloadable CSV", async () => {
    const user = userEvent.setup();
    render(<ResponseExplorer responses={demoResponses} />);
    expect(screen.getAllByRole("row")).toHaveLength(7);
    await user.click(screen.getByRole("button", { name: "Load more responses" }));
    expect(screen.getAllByRole("row")).toHaveLength(13);
    expect(screen.getByRole("link", { name: "Export CSV" })).toHaveAttribute("download", "customer-research-responses.csv");
    expect(screen.getByRole("link", { name: "Export CSV" })).toHaveAttribute("href", expect.stringContaining("data:text/csv"));
  });
});
