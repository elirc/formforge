# Concept 07: Effects, debounce, and concurrency

An effect synchronizes React state with something outside React. It is not a second event-handler system. Autosave therefore starts from a schema change, schedules one external write, cancels obsolete scheduled work, and reports the result.

Debounce reduces redundant writes but does not provide concurrency control. Two tabs can pause at the same time, and two already-started requests can finish in a different order. The repository’s expected version protects server truth; the UI’s state machine communicates queued, saving, saved, and conflict states.

Tests should use a controlled clock for debounce, a controlled repository for version conflicts, and deferred promises for request-order races. A passing timer test alone does not prove that overlapping requests are safe.
