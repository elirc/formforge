import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App, appRouter } from "./App.js";

describe("public form route", () => {
  it("renders the published snapshot and returns a submission receipt", async () => {
    const user = userEvent.setup();
    await appRouter.navigate({ to: "/f/$slug", params: { slug: "customer-research" } });
    render(<App />);

    expect(await screen.findByText("Published snapshot v1")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Ada");
    await user.type(screen.getByRole("textbox", { name: /work email/i }), "ada@example.com");
    await user.click(screen.getByRole("checkbox", { name: /agree to be contacted/i }));
    await user.click(screen.getByRole("button", { name: "Submit response" }));
    expect(screen.getByText("Receipt demo-receipt-001")).toBeInTheDocument();
  });
});
