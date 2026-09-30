'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { initial, submit } = require('./submission-scope-model.cjs');
const request = (publicationId = 'P1', key = 'attempt-1', answers = { name: 'Ada' }) => ({ publicationId, key, answers });

test('new operation stores a detached answer snapshot', () => {
  const input = request();
  const outcome = submit(initial(), input);
  input.answers.name = 'Changed';
  outcome.result.submission.answers.name = 'Also changed';
  assert.equal(outcome.state.entries[0].submission.answers.name, 'Ada');
});
test('changed answers under the same scope replay the first result', () => {
  const first = submit(initial(), request());
  const replay = submit(first.state, request('P1', 'attempt-1', { name: 'Grace' }));
  assert.equal(replay.result.status, 'duplicate');
  assert.equal(replay.result.submission.answers.name, 'Ada');
  assert.equal(replay.state.next, 2);
});
test('a new publication creates a different scope for the same key', () => {
  const first = submit(initial(), request());
  const next = submit(first.state, request('P2'));
  assert.equal(next.result.status, 'created');
  assert.equal(next.state.entries.length, 2);
});
test('earlier validation can reject before duplicate lookup', () => {
  const first = submit(initial(), request());
  const rejected = submit(first.state, request(), false);
  assert.deepEqual(rejected.result, { status: 'rejected' });
  assert.equal(rejected.state, first.state);
});
test('creation does not mutate the previous state', () => {
  const before = initial();
  submit(before, request());
  assert.deepEqual(before, { next: 1, entries: [] });
});
test('the model uses an unambiguous tuple scope, unlike a delimiter assumption', () => {
  const first = submit(initial(), request('a\u0000b', 'c'));
  const second = submit(first.state, request('a', 'b\u0000c'));
  assert.equal(second.result.status, 'created');
  assert.equal(second.state.entries.length, 2);
});
