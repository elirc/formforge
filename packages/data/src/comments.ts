import { parseMentions, type CollaborationComment } from "@formforge/core";

export interface CreateCommentInput {
  readonly workspaceId: string;
  readonly formId: string;
  readonly author: string;
  readonly body: string;
}

export interface CommentRepository {
  list(workspaceId: string, formId: string): Promise<readonly CollaborationComment[]>;
  create(input: CreateCommentInput): Promise<CollaborationComment>;
}

export class InMemoryCommentRepository implements CommentRepository {
  readonly #comments: CollaborationComment[] = [];
  readonly #now: () => Date;
  #sequence = 0;

  constructor(now: () => Date = () => new Date()) {
    this.#now = now;
  }

  async list(workspaceId: string, formId: string) {
    return Promise.resolve(structuredClone(this.#comments.filter((comment) => comment.workspaceId === workspaceId && comment.formId === formId)));
  }

  async create(input: CreateCommentInput) {
    if (!input.body.trim()) return Promise.reject(new Error("A comment body is required."));
    this.#sequence += 1;
    const comment: CollaborationComment = {
      id: `comment-${this.#sequence}`,
      workspaceId: input.workspaceId,
      formId: input.formId,
      author: input.author,
      body: input.body.trim(),
      mentions: parseMentions(input.body),
      createdAt: this.#now().toISOString(),
    };
    this.#comments.push(comment);
    return Promise.resolve(structuredClone(comment));
  }
}
