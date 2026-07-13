import { parseFormSchema, validateResponse, validateSchema, type AnswerValue, type FormSchema } from "@formforge/core";
import { InMemoryDraftRepository, InMemoryPublicationRepository, InMemorySubmissionRepository, type DraftRepository, type PublicationRepository, type SubmissionRepository } from "@formforge/data";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import type { OperationalEventSink } from "./operational-events.js";

export interface ApiOptions {
  readonly drafts?: DraftRepository;
  readonly publications?: PublicationRepository;
  readonly submissions?: SubmissionRepository;
  readonly readiness?: () => boolean | Promise<boolean>;
  readonly events?: OperationalEventSink;
  readonly now?: () => Date;
}

function parseAnswers(input: unknown): Readonly<Record<string, AnswerValue | undefined>> | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  if (!Object.values(input).every((value) => typeof value === "string" || typeof value === "boolean")) return undefined;
  return input as Readonly<Record<string, AnswerValue | undefined>>;
}

export function buildApi(options: ApiOptions = {}) {
  const app = Fastify({
    logger: false,
    genReqId: (request) => {
      const candidate = request.headers["x-request-id"];
      return typeof candidate === "string" && /^[a-zA-Z0-9._:-]{1,100}$/.test(candidate) ? candidate : randomUUID();
    },
  });
  const drafts = options.drafts ?? new InMemoryDraftRepository();
  const publications = options.publications ?? new InMemoryPublicationRepository();
  const submissions = options.submissions ?? new InMemorySubmissionRepository();
  const readiness = options.readiness ?? (() => true);
  const now = options.now ?? (() => new Date());

  app.addHook("onResponse", async (request, reply) => {
    options.events?.({
      timestamp: now().toISOString(),
      level: reply.statusCode >= 500 ? "error" : reply.statusCode >= 400 ? "warn" : "info",
      event: "http.request.completed",
      requestId: request.id,
      method: request.method,
      route: request.routeOptions.url ?? "unmatched",
      statusCode: reply.statusCode,
      durationMs: Math.round(reply.elapsedTime),
    });
  });

  app.get("/health", async () => ({ status: "ok", service: "formforge-api" }));
  app.get("/health/ready", async (_request, reply) => {
    try {
      const ready = await readiness();
      return ready
        ? { status: "ready", service: "formforge-api", checks: { dependencies: "ok" } }
        : reply.code(503).send({ status: "not_ready", service: "formforge-api", checks: { dependencies: "failed" } });
    } catch {
      return reply.code(503).send({ status: "not_ready", service: "formforge-api", checks: { dependencies: "failed" } });
    }
  });
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
  app.post<{ Params: { workspaceId: string; formId: string }; Body: { schema?: FormSchema; slug?: string } }>("/workspaces/:workspaceId/forms/:formId/publish", async (request, reply) => {
    if (request.headers["x-workspace-id"] !== request.params.workspaceId) return reply.code(403).send({ code: "workspace_forbidden" });
    if (typeof request.body?.slug !== "string" || !/^[a-z0-9-]{3,64}$/.test(request.body.slug)) return reply.code(400).send({ code: "invalid_slug" });
    let schema: FormSchema;
    try {
      schema = parseFormSchema(request.body.schema);
    } catch {
      return reply.code(400).send({ code: "invalid_schema" });
    }
    const issues = validateSchema(schema);
    if (issues.length > 0) return reply.code(422).send({ code: "schema_not_publishable", issues });
    const publication = await publications.publish({ workspaceId: request.params.workspaceId, formId: request.params.formId, slug: request.body.slug, schema });
    return reply.code(201).send(publication);
  });
  app.get<{ Params: { slug: string } }>("/public/forms/:slug", async (request, reply) => {
    const publication = await publications.findBySlug(request.params.slug);
    return publication ?? reply.code(404).send({ code: "form_not_found" });
  });
  app.post<{ Params: { slug: string }; Body: { idempotencyKey?: string; answers?: unknown } }>("/public/forms/:slug/submissions", async (request, reply) => {
    const publication = await publications.findBySlug(request.params.slug);
    if (!publication) return reply.code(404).send({ code: "form_not_found" });
    const answers = parseAnswers(request.body?.answers);
    if (!answers || typeof request.body?.idempotencyKey !== "string" || request.body.idempotencyKey.length < 8) return reply.code(400).send({ code: "invalid_submission" });
    const errors = validateResponse(publication.schema, answers);
    if (Object.keys(errors).length > 0) return reply.code(422).send({ code: "response_invalid", errors });
    const result = await submissions.submit(publication.id, request.body.idempotencyKey, answers);
    return reply.code(result.status === "created" ? 201 : 200).send(result);
  });
  return app;
}
