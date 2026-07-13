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

function copyPublication(publication: PublishedForm): PublishedForm {
  return structuredClone(publication);
}

export class InMemoryPublicationRepository implements PublicationRepository {
  readonly #bySlug = new Map<string, PublishedForm[]>();
  readonly #now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.#now = now;
  }

  async publish(input: PublishInput): Promise<PublishedForm> {
    const versions = this.#bySlug.get(input.slug) ?? [];
    const version = versions.length + 1;
    const publication: PublishedForm = {
      id: `${input.workspaceId}:${input.formId}:v${version}`,
      workspaceId: input.workspaceId,
      formId: input.formId,
      slug: input.slug,
      version,
      schema: structuredClone(input.schema),
      publishedAt: this.#now().toISOString(),
    };
    this.#bySlug.set(input.slug, [...versions, publication]);
    return Promise.resolve(copyPublication(publication));
  }

  async findBySlug(slug: string) {
    const publication = this.#bySlug.get(slug)?.at(-1);
    return Promise.resolve(publication ? copyPublication(publication) : undefined);
  }

  async listVersions(workspaceId: string, formId: string) {
    const versions = [...this.#bySlug.values()].flat().filter((item) => item.workspaceId === workspaceId && item.formId === formId);
    return Promise.resolve(versions.map(copyPublication));
  }
}
