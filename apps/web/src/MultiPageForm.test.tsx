import { demoForm, demoFormFlow, nextSession, serializeSession, startSession } from "@formforge/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MultiPageForm } from "./MultiPageForm.js";

describe("multi-page form", () => {
  it("validates each page and follows an answer-based early-completion branch", async () => {
    const user = userEvent.setup();
    render(<MultiPageForm schema={demoForm} flow={demoFormFlow} storageKey="test:flow:early" />);

    expect(screen.getByRole("heading", { name: "About you" })).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Ada");
    await user.type(screen.getByRole("textbox", { name: /work email/i }), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Your work" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: /your role/i }), "design");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Response complete" })).toBeInTheDocument();
  });

  it("resumes a valid local session and moves back through visit history", async () => {
    const user = userEvent.setup();
    const storageKey = "test:flow:resume";
    window.localStorage.setItem(storageKey, serializeSession(nextSession(demoFormFlow, startSession(demoFormFlow))));
    render(<MultiPageForm schema={demoForm} flow={demoFormFlow} storageKey={storageKey} />);

    expect(screen.getByRole("heading", { name: "Your work" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "About you" })).toBeInTheDocument();
  });
});
