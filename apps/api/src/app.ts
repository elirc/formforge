import { parseFormSchema, type FormSchema } from "@formforge/core";
import { InMemoryDraftRepository, type DraftRepository } from "@formforge/data";
import Fastify from "fastify";

export function buildApi(options: { drafts?: DraftRepository } = {}) {
  const app = Fastify({ logger: false });
  const drafts = options.drafts ?? new InMemoryDraftRepository();
  app.get("/health", async () => ({ status: "ok", service: "formforge-api" }));
  app.get<{ Params: { workspaceId: string; formId: string } }>("/workspaces/:workspaceId/forms/:formId/draft", async (request, reply) => {
    const draft = await drafts.find(request.params.workspaceId, request.params.formId);
    return draft ?? reply.code(404).send({ code: "draft_not_found" });
  });
  app.put<{ Params: { workspaceId: string; formId: string }; Body: { schema?: FormSchema; expectedVersion?: number } }>("/workspaces/:workspaceId/forms/:formId/draft", async (request, reply) => {
    const expectedVersion = request.body?.expectedVersion;
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion === undefined || expectedVersion < 0) {
      return reply.code(400).send({ code: "invalid_draft" });
    }
    let schema: FormSchema;
    try {
      schema = parseFormSchema(request.body?.schema);
    } catch {
      return reply.code(400).send({ code: "invalid_draft" });
    }
    const result = await drafts.save({
      workspaceId: request.params.workspaceId,
      formId: request.params.formId,
      schema,
      expectedVersion,
    });
    return result.status === "conflict" ? reply.code(409).send(result) : reply.code(200).send(result);
  });
  return app;
}
