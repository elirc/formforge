import { describe, expect, it } from "vitest";
import { demoForm } from "@formforge/core";
import { buildApi } from "./app.js";
import { serializeOperationalEvent, type OperationalEvent } from "./operational-events.js";

describe("API health", () => {
  it("rejects a schema identity different from the route without storing it", async () => {
    const app = buildApi();
    const base = "/workspaces/acme/forms/route-form";
    const draft = await app.inject({ method: "PUT", url: `${base}/draft`, payload: { expectedVersion: 0, schema: demoForm } });
    const publication = await app.inject({ method: "POST", url: `${base}/publish`, headers: { "x-workspace-id": "acme" }, payload: { slug: "mismatch-form", schema: demoForm } });
    expect(draft.statusCode).toBe(400);
    expect(publication.statusCode).toBe(400);
    expect(draft.json()).toEqual({ code: "form_identity_mismatch" });
    expect((await app.inject({ method: "GET", url: `${base}/draft` })).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: "/public/forms/mismatch-form" })).statusCode).toBe(404);
    await app.close();
  });

  it("reports a slug conflict without replacing the owner's published form", async () => {
    const app = buildApi();
    const payload = { slug: "owned-research", schema: demoForm };
    await app.inject({ method: "POST", url: `/workspaces/acme/forms/${demoForm.id}/publish`, headers: { "x-workspace-id": "acme" }, payload });
    const conflict = await app.inject({ method: "POST", url: `/workspaces/other/forms/${demoForm.id}/publish`, headers: { "x-workspace-id": "other" }, payload });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toEqual({ code: "slug_unavailable" });
    expect((await app.inject({ method: "GET", url: "/public/forms/owned-research" })).json()).toMatchObject({ workspaceId: "acme", version: 1 });
    await app.close();
  });

  it("exposes a deterministic readiness boundary", async () => {
    const app = buildApi();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "formforge-api" });
    await app.close();
  });

  it("reports dependency readiness without confusing it with liveness", async () => {
    const ready = buildApi({ readiness: () => true });
    const unavailable = buildApi({ readiness: () => false });

    expect((await ready.inject({ method: "GET", url: "/health/ready" })).json()).toEqual({
      status: "ready",
      service: "formforge-api",
      checks: { dependencies: "ok" },
    });
    const failed = await unavailable.inject({ method: "GET", url: "/health/ready" });
    expect(failed.statusCode).toBe(503);
    expect(failed.json()).toMatchObject({ status: "not_ready", checks: { dependencies: "failed" } });
    await Promise.all([ready.close(), unavailable.close()]);
  });

  it("emits request-correlated structured events without request payloads", async () => {
    const events: OperationalEvent[] = [];
    const app = buildApi({
      events: (event) => events.push(event),
      now: () => new Date("2026-07-13T09:00:00.000Z"),
    });
    await app.inject({ method: "GET", url: "/health", headers: { "x-request-id": "release-probe-001" } });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      timestamp: "2026-07-13T09:00:00.000Z",
      level: "info",
      event: "http.request.completed",
      requestId: "release-probe-001",
      method: "GET",
      route: "/health",
      statusCode: 200,
    });
    expect(serializeOperationalEvent(events[0]!)).not.toContain("payload");
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
