import Fastify from "fastify";

export function buildApi() {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ status: "ok", service: "formforge-api" }));
  return app;
}
