import { createHash } from "node:crypto";
import { createSeedDataset } from "../packages/data/src/seed.js";

const first = JSON.stringify(createSeedDataset());
const second = JSON.stringify(createSeedDataset());
if (first !== second) throw new Error("Seed generation is not deterministic.");

const dataset = JSON.parse(first) as ReturnType<typeof createSeedDataset>;
const fingerprint = createHash("sha256").update(first).digest("hex").slice(0, 16);
console.log(JSON.stringify({
  event: "seed.verified",
  scenario: dataset.scenario,
  fingerprint,
  workspaces: 1,
  forms: dataset.workspace.forms.length,
  responses: dataset.responses.length,
  comments: dataset.comments.length,
}));
