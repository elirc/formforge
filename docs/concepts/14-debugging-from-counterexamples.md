# Concept 14: Debugging from counterexamples

A useful bug report names a prior state, an action, and an incorrect observable result. Turn that smallest counterexample into a test before changing code.

- Reordering showed focus and disclosure state moving to another field.
- Two deferred saves showed a second write using a stale version.
- Three valid rule references formed a cycle the direct check missed.
- A rejected mutation left a pending comment visible forever.

The fix should strengthen the model, not special-case the example: stable keys, explicit focus restoration, serialized requests, graph traversal, and rollback by temporary identity solve whole classes of inputs.
