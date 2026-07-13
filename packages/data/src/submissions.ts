import type { AnswerValue } from "@formforge/core";

export interface SubmissionRecord {
  readonly id: string;
  readonly publicationId: string;
  readonly idempotencyKey: string;
  readonly answers: Readonly<Record<string, AnswerValue | undefined>>;
  readonly submittedAt: string;
}

export type SubmitResult =
  | { readonly status: "created"; readonly submission: SubmissionRecord }
  | { readonly status: "duplicate"; readonly submission: SubmissionRecord };

export interface SubmissionRepository {
  submit(publicationId: string, idempotencyKey: string, answers: Readonly<Record<string, AnswerValue | undefined>>): Promise<SubmitResult>;
}

export class InMemorySubmissionRepository implements SubmissionRepository {
  readonly #byRequest = new Map<string, SubmissionRecord>();
  readonly #now: () => Date;
  #sequence = 0;

  constructor(now: () => Date = () => new Date()) {
    this.#now = now;
  }

  async submit(publicationId: string, idempotencyKey: string, answers: Readonly<Record<string, AnswerValue | undefined>>): Promise<SubmitResult> {
    const requestKey = `${publicationId}\u0000${idempotencyKey}`;
    const existing = this.#byRequest.get(requestKey);
    if (existing) return Promise.resolve({ status: "duplicate", submission: structuredClone(existing) });

    this.#sequence += 1;
    const submission: SubmissionRecord = {
      id: `submission-${this.#sequence}`,
      publicationId,
      idempotencyKey,
      answers: structuredClone(answers),
      submittedAt: this.#now().toISOString(),
    };
    this.#byRequest.set(requestKey, submission);
    return Promise.resolve({ status: "created", submission: structuredClone(submission) });
  }
}
