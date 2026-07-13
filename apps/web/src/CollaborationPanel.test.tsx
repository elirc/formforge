import { demoForm, type CollaborationComment } from "@formforge/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommentsPanel, VersionHistory, type CreateComment } from "./CollaborationPanel.js";

describe("comments and version history", () => {
  it("renders an optimistic comment then reconciles server identity", async () => {
    const user = userEvent.setup();
    const saved: CollaborationComment = { id: "comment-42", workspaceId: "acme", formId: demoForm.id, author: "Eli", body: "Please review @Ada", mentions: ["ada"], createdAt: "2026-07-13T15:00:00Z" };
    const create = vi.fn<CreateComment>().mockResolvedValue(saved);
    render(<CommentsPanel initialComments={[]} createComment={create} />);

    await user.type(screen.getByRole("textbox", { name: "Add a comment" }), saved.body);
    await user.click(screen.getByRole("button", { name: "Comment" }));
    expect(await screen.findByText("Eli")).toBeInTheDocument();
    expect(screen.getByText("@ada")).toBeInTheDocument();
    expect(create).toHaveBeenCalledWith(saved.body);
  });

  it("explains field changes between immutable versions", () => {
    render(<VersionHistory current={demoForm} />);
    expect(screen.getByText(/Renamed form from/)).toBeInTheDocument();
    expect(screen.getByText("Added Research consent.")).toBeInTheDocument();
  });

  it("rolls back a rejected optimistic comment while preserving retry text", async () => {
    const user = userEvent.setup();
    const create = vi.fn<CreateComment>().mockRejectedValue(new Error("offline"));
    render(<CommentsPanel initialComments={[]} createComment={create} />);
    const textbox = screen.getByRole("textbox", { name: "Add a comment" });
    await user.type(textbox, "Keep this draft for retry");
    await user.click(screen.getByRole("button", { name: "Comment" }));

    expect(await screen.findByText("Comment failed to send. Try again.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(textbox).toHaveValue("Keep this draft for retry");
  });
});
