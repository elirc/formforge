# Concept 13: Optimistic state and diffs

Optimistic UI is a prediction, not a completed mutation. The client creates temporary identity, shows pending state, sends the command, then either replaces the prediction with server truth or recovers from rejection.

Tests must control the promise. A resolved promise checks reconciliation; a deferred promise exposes the pending state; a rejected promise checks rollback and error messaging. Testing only the happy path leaves half the state machine unspecified.

Version diffs have a similar identity rule. Compare fields by stable ID, then describe property changes. Comparing array positions would call a reorder a removal plus an addition and teach users the wrong history.
