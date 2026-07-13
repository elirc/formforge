import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary, NetworkStatus } from "./Resilience.js";

function BrokenView(): never {
  throw new Error("render failure");
}

describe("resilience boundaries", () => {
  it("contains a render failure and offers a reset action", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<ErrorBoundary><BrokenView /></ErrorBoundary>);
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset view" })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("announces offline state and clears it when connectivity returns", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    render(<NetworkStatus />);
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    await act(async () => window.dispatchEvent(new Event("offline")));
    expect(screen.getByRole("status")).toHaveTextContent("You are offline");
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    await act(async () => window.dispatchEvent(new Event("online")));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
