import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App, appRouter } from "./App.js";

describe("application shell", () => {
  it("gives authors semantic navigation and an obvious starting action", async () => {
    await appRouter.navigate({ to: "/" });
    render(<App />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /build forms people enjoy answering/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create a form/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
    expect(screen.getAllByText("ready")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: /fifteen evidence-backed sprints/i })).toBeInTheDocument();
  });
});
