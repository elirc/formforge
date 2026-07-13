import { demoForm } from "@formforge/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormRenderer } from "./FormRenderer.js";

describe("typed form renderer", () => {
  it("renders labels, hints, required state, and variant-appropriate controls", () => {
    render(<FormRenderer schema={demoForm} />);

    expect(screen.getByRole("heading", { name: "Customer research" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /your name/i })).toBeRequired();
    expect(screen.getByRole("textbox", { name: /work email/i })).toHaveAttribute("type", "email");
    expect(screen.getByRole("combobox", { name: /your role/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /agree to be contacted/i })).toBeRequired();
  });
});
