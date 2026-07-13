import { render, screen, waitFor } from "@testing-library/react";
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

  it("offers a complete keyboard ordering path and announces the result", async () => {
    const user = userEvent.setup();
    render(<FormBuilder />);

    await user.click(screen.getByRole("button", { name: "Move Work email up" }));

    const orderedFields = screen.getAllByRole("listitem");
    expect(orderedFields[0]).toHaveTextContent("Work email");
    expect(screen.getByText("Moved Work email to position 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move Work email up" })).toBeDisabled();
  });

  it("keeps keyboard focus with the field that was moved", async () => {
    const user = userEvent.setup();
    render(<FormBuilder />);
    await user.click(screen.getByRole("button", { name: "Move Work email up" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Edit Work email" })).toHaveFocus());
  });

  it("updates required state and switches the responsive preview", async () => {
    const user = userEvent.setup();
    render(<FormBuilder />);

    const required = screen.getByRole("checkbox", { name: "Required response" });
    expect(required).toBeChecked();
    await user.click(required);
    expect(required).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Mobile" }));
    expect(screen.getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true");
  });
});
