import { describe, expect, it } from "vitest";
import { demoForm } from "@formforge/core";
import { buildApi } from "./app.js";

describe("API health", () => {
  it("exposes a deterministic readiness boundary", async () => {
    const app = buildApi();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "formforge-api" });
    await app.close();
  });

  it("saves a draft and rejects a stale version without losing server truth", async () => {
    const app = buildApi();
    const url = `/workspaces/acme/forms/${demoForm.id}/draft`;
    const first = await app.inject({ method: "PUT", url, payload: { schema: demoForm, expectedVersion: 0 } });
    const conflict = await app.inject({ method: "PUT", url, payload: { schema: { ...demoForm, title: "Stale" }, expectedVersion: 0 } });

    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({ status: "saved", draft: { version: 1 } });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toMatchObject({ status: "conflict", current: { version: 1, schema: { title: demoForm.title } } });
    await app.close();
  });

  it("rejects malformed draft input at the HTTP boundary", async () => {
    const app = buildApi();
    const response = await app.inject({ method: "PUT", url: "/workspaces/acme/forms/form/draft", payload: { schema: { title: "not enough" }, expectedVersion: -1 } });
    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("authorizes publication by workspace and serves an immutable public snapshot", async () => {
    const app = buildApi();
    const publishUrl = `/workspaces/acme/forms/${demoForm.id}/publish`;
    const forbidden = await app.inject({ method: "POST", url: publishUrl, headers: { "x-workspace-id": "other" }, payload: { slug: "customer-research", schema: demoForm } });
    const published = await app.inject({ method: "POST", url: publishUrl, headers: { "x-workspace-id": "acme" }, payload: { slug: "customer-research", schema: demoForm } });
    const publicForm = await app.inject({ method: "GET", url: "/public/forms/customer-research" });

    expect(forbidden.statusCode).toBe(403);
    expect(published.statusCode).toBe(201);
    expect(publicForm.json()).toMatchObject({ workspaceId: "acme", version: 1, schema: { title: demoForm.title } });
    await app.close();
  });

  it("validates public answers and deduplicates a retried submission", async () => {
    const app = buildApi();
    await app.inject({ method: "POST", url: `/workspaces/acme/forms/${demoForm.id}/publish`, headers: { "x-workspace-id": "acme" }, payload: { slug: "customer-research", schema: demoForm } });
    const url = "/public/forms/customer-research/submissions";
    const invalid = await app.inject({ method: "POST", url, payload: { idempotencyKey: "request-invalid", answers: {} } });
    const payload = { idempotencyKey: "request-12345", answers: { name: "Ada", email: "ada@example.com", role: "design", consent: true } };
    const [first, retry] = await Promise.all([app.inject({ method: "POST", url, payload }), app.inject({ method: "POST", url, payload })]);

    expect(invalid.statusCode).toBe(422);
    expect([first.statusCode, retry.statusCode].sort()).toEqual([200, 201]);
    expect(first.json().submission.id).toBe(retry.json().submission.id);
    await app.close();
  });
});
