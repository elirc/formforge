import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App, appRouter } from "./App.js";

describe("typed workspace routes", () => {
  it("loads workspace identity from the URL and renders the requested boundary", async () => {
    await appRouter.navigate({ to: "/workspaces/$workspaceId/$view", params: { workspaceId: "acme", view: "responses" } });
    render(<App />);

    expect(await screen.findByRole("heading", { name: "responses", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No responses yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Responses" })).toHaveAttribute("aria-current", "page");
  });
});
