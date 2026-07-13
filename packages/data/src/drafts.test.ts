import { demoForm } from "@formforge/core";
import { describe, expect, it } from "vitest";
import { InMemoryDraftRepository } from "./drafts.js";

describe("versioned draft repository", () => {
  it("isolates drafts by workspace and form identity", async () => {
    const repository = new InMemoryDraftRepository(() => new Date("2026-07-13T12:00:00Z"));
    const saved = await repository.save({ workspaceId: "acme", formId: demoForm.id, schema: demoForm, expectedVersion: 0 });

    expect(saved.status).toBe("saved");
    expect((await repository.find("acme", demoForm.id))?.version).toBe(1);
    expect(await repository.find("other", demoForm.id)).toBeUndefined();
  });

  it("allows one writer and reports the current version to a stale writer", async () => {
    const repository = new InMemoryDraftRepository();
    await repository.save({ workspaceId: "acme", formId: demoForm.id, schema: demoForm, expectedVersion: 0 });

    const firstWriter = await repository.save({ workspaceId: "acme", formId: demoForm.id, schema: { ...demoForm, title: "First" }, expectedVersion: 1 });
    const staleWriter = await repository.save({ workspaceId: "acme", formId: demoForm.id, schema: { ...demoForm, title: "Stale" }, expectedVersion: 1 });

    expect(firstWriter.status).toBe("saved");
    expect(staleWriter).toMatchObject({ status: "conflict", current: { version: 2, schema: { title: "First" } } });
  });

  it("returns copies so callers cannot mutate stored state", async () => {
    const repository = new InMemoryDraftRepository();
    const saved = await repository.save({ workspaceId: "acme", formId: demoForm.id, schema: demoForm, expectedVersion: 0 });
    if (saved.status !== "saved") throw new Error("expected a saved draft");

    saved.draft.schema.title = "Mutation outside repository";
    expect((await repository.find("acme", demoForm.id))?.schema.title).toBe(demoForm.title);
  });
});
