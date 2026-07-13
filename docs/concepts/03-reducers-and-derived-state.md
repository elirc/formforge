# Concept 03: Reducers and derived state

A reducer is useful when several interactions change the same state through named transitions. FormForge's field list, settings, and preview are not three states: they are three projections of one schema.

The selected field object is derived by ID during render. Storing both the ID and a copied field would require synchronization after edits or deletion. This is the “single source of truth” idea in concrete form.

Actions are discriminated unions, so the reducer narrows each payload. IDs and timestamps arrive as action data; keeping nondeterminism outside the reducer makes transition tests stable.
