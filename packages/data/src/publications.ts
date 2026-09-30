import type { FormSchema } from "@formforge/core";

export interface PublishedForm {
  readonly id: string;
  readonly workspaceId: string;
  readonly formId: string;
  readonly slug: string;
  readonly version: number;
  readonly schema: FormSchema;
  readonly publishedAt: string;
}

export interface PublishInput {
  readonly workspaceId: string;
  readonly formId: string;
  readonly slug: string;
  readonly schema: FormSchema;
}

export interface PublicationRepository {
  publish(input: PublishInput): Promise<PublishedForm>;
  findBySlug(slug: string): Promise<PublishedForm | undefined>;
  listVersions(workspaceId: string, formId: string): Promise<readonly PublishedForm[]>;
}

export class PublicationSlugConflictError extends Error {
  constructor() {
    super("The public slug belongs to another form.");
    this.name = "PublicationSlugConflictError";
  }
}

function copyPublication(publication: PublishedForm): PublishedForm {
  return structuredClone(publication);
}

export class InMemoryPublicationRepository implements PublicationRepository {
  readonly #bySlug = new Map<string, PublishedForm[]>();
  readonly #byForm = new Map<string, PublishedForm[]>();
  readonly #now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.#now = now;
  }

  async publish(input: PublishInput): Promise<PublishedForm> {
    const versions = this.#bySlug.get(input.slug) ?? [];
    const owner = versions[0];
    if (owner && (owner.workspaceId !== input.workspaceId || owner.formId !== input.formId)) {
      throw new PublicationSlugConflictError();
    }
    const formKey = JSON.stringify([input.workspaceId, input.formId]);
    const formVersions = this.#byForm.get(formKey) ?? [];
    const version = formVersions.length + 1;
    const publication: PublishedForm = {
      id: globalThis.crypto.randomUUID(),
      workspaceId: input.workspaceId,
      formId: input.formId,
      slug: input.slug,
      version,
      schema: structuredClone(input.schema),
      publishedAt: this.#now().toISOString(),
    };
    this.#bySlug.set(input.slug, [...versions, publication]);
    this.#byForm.set(formKey, [...formVersions, publication]);
    return Promise.resolve(copyPublication(publication));
  }

  async findBySlug(slug: string) {
    const publication = this.#bySlug.get(slug)?.at(-1);
    return Promise.resolve(publication ? copyPublication(publication) : undefined);
  }

  async listVersions(workspaceId: string, formId: string) {
    const versions = this.#byForm.get(JSON.stringify([workspaceId, formId])) ?? [];
    return Promise.resolve(versions.map(copyPublication));
  }
}
