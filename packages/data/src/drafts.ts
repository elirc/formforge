import type { FormSchema } from "@formforge/core";

export interface DraftRecord {
  readonly workspaceId: string;
  readonly formId: string;
  readonly schema: FormSchema;
  readonly version: number;
  readonly updatedAt: string;
}

export interface SaveDraftInput {
  readonly workspaceId: string;
  readonly formId: string;
  readonly schema: FormSchema;
  readonly expectedVersion: number;
}

export type SaveDraftResult =
  | { readonly status: "saved"; readonly draft: DraftRecord }
  | { readonly status: "conflict"; readonly current: DraftRecord | undefined };

export interface DraftRepository {
  find(workspaceId: string, formId: string): Promise<DraftRecord | undefined>;
  save(input: SaveDraftInput): Promise<SaveDraftResult>;
}

function copyDraft(draft: DraftRecord): DraftRecord {
  return structuredClone(draft);
}

export class InMemoryDraftRepository implements DraftRepository {
  readonly #drafts = new Map<string, DraftRecord>();
  readonly #now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.#now = now;
  }

  async find(workspaceId: string, formId: string) {
    const draft = this.#drafts.get(this.#key(workspaceId, formId));
    return Promise.resolve(draft ? copyDraft(draft) : undefined);
  }

  async save(input: SaveDraftInput): Promise<SaveDraftResult> {
    const key = this.#key(input.workspaceId, input.formId);
    const current = this.#drafts.get(key);
    if (input.expectedVersion !== (current?.version ?? 0)) {
      return Promise.resolve({ status: "conflict", current: current ? copyDraft(current) : undefined });
    }

    const draft: DraftRecord = {
      workspaceId: input.workspaceId,
      formId: input.formId,
      schema: structuredClone(input.schema),
      version: input.expectedVersion + 1,
      updatedAt: this.#now().toISOString(),
    };
    this.#drafts.set(key, draft);
    return Promise.resolve({ status: "saved", draft: copyDraft(draft) });
  }

  #key(workspaceId: string, formId: string) {
    return `${workspaceId}\u0000${formId}`;
  }
}
