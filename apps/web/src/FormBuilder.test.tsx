import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormBuilder } from "./FormBuilder.js";

describe("visual form builder", () => {
  it("adds, edits, duplicates, and removes fields through visible controls", async () => {
    const user = userEvent.setup();
    render(<FormBuilder />);

    await user.click(screen.getByRole("button", { name: /^email$/i }));
    const label = screen.getByRole("textbox", { name: "Label" });
    await user.clear(label);
    await user.type(label, "Contact email");
    expect(screen.getByRole("textbox", { name: /contact email/i })).toHaveAttribute("type", "email");

    await user.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(screen.getByDisplayValue("Contact email copy")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByDisplayValue("Contact email copy")).not.toBeInTheDocument();
  });
});
