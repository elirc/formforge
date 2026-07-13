import { demoForm } from "@formforge/core";
import { describe, expect, it } from "vitest";
import { InMemoryPublicationRepository } from "./publications.js";
import { InMemorySubmissionRepository } from "./submissions.js";

describe("publishing and submission repositories", () => {
  it("keeps immutable publication snapshots while serving the latest slug", async () => {
    const publications = new InMemoryPublicationRepository(() => new Date("2026-07-13T12:00:00Z"));
    const first = await publications.publish({ workspaceId: "acme", formId: demoForm.id, slug: "research", schema: demoForm });
    await publications.publish({ workspaceId: "acme", formId: demoForm.id, slug: "research", schema: { ...demoForm, title: "Updated" } });

    expect(first).toMatchObject({ version: 1, schema: { title: demoForm.title } });
    expect(await publications.findBySlug("research")).toMatchObject({ version: 2, schema: { title: "Updated" } });
    expect((await publications.listVersions("acme", demoForm.id)).map((item) => item.version)).toEqual([1, 2]);
  });

  it("deduplicates concurrent retries atomically", async () => {
    const submissions = new InMemorySubmissionRepository();
    const attempts = await Promise.all(Array.from({ length: 8 }, () => submissions.submit("publication-1", "request-1", { name: "Ada" })));

    expect(attempts.filter((attempt) => attempt.status === "created")).toHaveLength(1);
    expect(new Set(attempts.map((attempt) => attempt.submission.id))).toEqual(new Set(["submission-1"]));
  });

  it("scopes idempotency keys to a publication", async () => {
    const submissions = new InMemorySubmissionRepository();
    const first = await submissions.submit("publication-1", "same-key", { name: "Ada" });
    const second = await submissions.submit("publication-2", "same-key", { name: "Grace" });
    expect([first.status, second.status]).toEqual(["created", "created"]);
  });
});
