'use strict';

// Educational model only. No application imports, network, or storage access.
// `valid` stands in for earlier route validation; it does not validate a schema.
function initial() { return { next: 1, entries: [] }; }
function submit(state, request, valid = true) {
  if (!valid) return { state, result: { status: 'rejected' } };
  const scope = JSON.stringify([request.publicationId, request.key]);
  const existing = state.entries.find((entry) => entry.scope === scope);
  if (existing) return { state, result: { status: 'duplicate', submission: structuredClone(existing.submission) } };
  const submission = {
    id: `model-submission-${state.next}`,
    publicationId: request.publicationId,
    key: request.key,
    answers: structuredClone(request.answers),
  };
  return {
    state: { next: state.next + 1, entries: [...state.entries, { scope, submission }] },
    result: { status: 'created', submission: structuredClone(submission) },
  };
}
module.exports = { initial, submit };
