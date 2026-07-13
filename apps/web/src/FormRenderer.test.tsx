import { demoForm, demoVisibilityRules } from "@formforge/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormRenderer } from "./FormRenderer.js";

describe("typed form renderer", () => {
  it("renders labels, hints, required state, and variant-appropriate controls", () => {
    render(<FormRenderer schema={demoForm} />);

    expect(screen.getByRole("heading", { name: "Customer research" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveAttribute("name", "name");
    expect(screen.getByRole("textbox", { name: /work email/i })).toHaveAttribute("type", "email");
    expect(screen.getByRole("combobox", { name: /your role/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /agree to be contacted/i })).toHaveAttribute("name", "consent");
  });

  it("links respondent validation errors to invalid controls", async () => {
    const user = userEvent.setup();
    render(<FormRenderer schema={demoForm} />);
    await user.click(screen.getByRole("button", { name: "Submit response" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Your name: This field is required.");
    expect(screen.getByRole("link", { name: /your name: this field is required/i })).toHaveAttribute("href", "#name");
    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveAttribute("aria-invalid", "true");
  });

  it("shows and hides a conditional field from live respondent answers", async () => {
    const user = userEvent.setup();
    render(<FormRenderer schema={demoForm} rules={demoVisibilityRules} />);

    expect(screen.queryByRole("checkbox", { name: /agree to be contacted/i })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: /your role/i }), "engineering");
    expect(screen.getByRole("checkbox", { name: /agree to be contacted/i })).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: /your role/i }), "design");
    expect(screen.queryByRole("checkbox", { name: /agree to be contacted/i })).not.toBeInTheDocument();
  });

  it("does not validate a required field while its rule hides it", async () => {
    const user = userEvent.setup();
    render(<FormRenderer schema={demoForm} rules={demoVisibilityRules} />);
    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Ada");
    await user.type(screen.getByRole("textbox", { name: /work email/i }), "ada@example.com");
    await user.selectOptions(screen.getByRole("combobox", { name: /your role/i }), "design");
    await user.click(screen.getByRole("button", { name: "Submit response" }));

    expect(screen.getByRole("status")).toHaveTextContent("Preview response is valid");
  });
});
