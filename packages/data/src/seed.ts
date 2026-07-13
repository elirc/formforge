import { demoResponses, demoWorkspace, type CollaborationComment, type ResponseRecord, type Workspace } from "@formforge/core";

export interface SeedDataset {
  readonly scenario: "formforge-v1";
  readonly generatedAt: string;
  readonly workspace: Workspace;
  readonly responses: readonly ResponseRecord[];
  readonly comments: readonly CollaborationComment[];
}

const releaseSeed: SeedDataset = {
  scenario: "formforge-v1",
  generatedAt: "2026-07-13T08:00:00.000Z",
  workspace: demoWorkspace,
  responses: demoResponses,
  comments: [
    {
      id: "comment-seed-001",
      workspaceId: "acme",
      formId: "customer-research",
      author: "Mina",
      body: "@sam Please verify the required consent language before release.",
      mentions: ["sam"],
      createdAt: "2026-07-13T08:30:00.000Z",
    },
  ],
};

/** Returns an isolated copy so a test or demo cannot mutate the canonical fixture. */
export function createSeedDataset(): SeedDataset {
  return structuredClone(releaseSeed);
}
