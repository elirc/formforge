/** Disposable in-process learning lab: no listening port or external storage. */
import assert from "node:assert/strict";
import { buildApi } from "../../apps/api/src/app.ts";
import { demoForm } from "../../packages/core/src/schema.ts";

const app = buildApi();
try {
  const publish = (workspaceId: string, slug: string, title: string) => app.inject({
    method: "POST",
    url: `/workspaces/${workspaceId}/forms/${demoForm.id}/publish`,
    headers: { "x-workspace-id": workspaceId },
    payload: { slug, schema: { ...demoForm, title } },
  });
  const first = await publish("acme", "research-a", "Original questions");
  const second = await publish("acme", "research-b", "Revised questions");
  assert.equal(first.statusCode, 201);
  assert.equal(second.statusCode, 201);
  assert.equal(first.json().version, 1);
  assert.equal(second.json().version, 2);
  assert.notEqual(first.json().id, second.json().id);

  const conflict = await publish("other", "research-a", "Unexpected replacement");
  assert.equal(conflict.statusCode, 409);
  assert.deepEqual(conflict.json(), { code: "slug_unavailable" });
  const original = await app.inject({ method: "GET", url: "/public/forms/research-a" });
  assert.equal(original.json().schema.title, "Original questions");
  assert.equal(original.json().workspaceId, "acme");

  const payload = {
    idempotencyKey: "same-logical-key",
    answers: { name: "Ada", email: "ada@example.com", role: "design", consent: true },
  };
  const one = await app.inject({ method: "POST", url: "/public/forms/research-a/submissions", payload });
  const two = await app.inject({ method: "POST", url: "/public/forms/research-b/submissions", payload });
  const replay = await app.inject({ method: "POST", url: "/public/forms/research-a/submissions", payload });
  assert.equal(one.statusCode, 201);
  assert.equal(two.statusCode, 201);
  assert.equal(replay.statusCode, 200);
  assert.notEqual(one.json().submission.id, two.json().submission.id);
  assert.equal(one.json().submission.id, replay.json().submission.id);

  const mismatch = await app.inject({ method: "PUT", url: "/workspaces/acme/forms/different-form/draft", payload: { schema: demoForm, expectedVersion: 0 } });
  assert.equal(mismatch.statusCode, 400);
  assert.deepEqual(mismatch.json(), { code: "form_identity_mismatch" });
  console.log(JSON.stringify({
    publicationVersions: [first.json().version, second.json().version],
    distinctSnapshots: first.json().id !== second.json().id,
    reservedSlugStatus: conflict.statusCode,
    submissionStatuses: [one.statusCode, two.statusCode, replay.statusCode],
    routeIdentityMismatchStatus: mismatch.statusCode,
    result: "All assertions passed; disposable memory state will now be discarded.",
  }, null, 2));
} finally {
  await app.close();
}
