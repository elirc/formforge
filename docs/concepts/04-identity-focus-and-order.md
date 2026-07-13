# Concept 04: Identity, focus, and order

Array position answers “where is this field now?” Identity answers “which field is this across changes?” React keys, selection, persistence, comments, and rules must use identity.

Reordering is a domain operation: remove one identified field and insert it at a bounded position without losing or duplicating IDs. Pointer and keyboard controls should reach that same transition.

After structural changes, ask where focus stays and what is announced. A visual move is not enough evidence for keyboard or screen-reader users; later accessibility audits deliberately revisit this interaction under harder state.
