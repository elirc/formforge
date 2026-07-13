import { describe, expect, it } from "vitest";
import { InMemoryCommentRepository } from "./comments.js";

describe("comment repository", () => {
  it("isolates lists by workspace and form and extracts mentions", async () => {
    const comments = new InMemoryCommentRepository(() => new Date("2026-07-13T12:00:00Z"));
    await comments.create({ workspaceId: "acme", formId: "form-1", author: "Eli", body: "Please review @Ada" });
    await comments.create({ workspaceId: "other", formId: "form-1", author: "Eli", body: "Other tenant" });

    expect(await comments.list("acme", "form-1")).toMatchObject([{ id: "comment-1", mentions: ["ada"], createdAt: "2026-07-13T12:00:00.000Z" }]);
  });
});
