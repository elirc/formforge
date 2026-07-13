import { describe, expect, it } from "vitest";
import { buildApi } from "./app.js";

describe("API health", () => {
  it("exposes a deterministic readiness boundary", async () => {
    const app = buildApi();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "formforge-api" });
    await app.close();
  });
});
