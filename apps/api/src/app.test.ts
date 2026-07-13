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
});
