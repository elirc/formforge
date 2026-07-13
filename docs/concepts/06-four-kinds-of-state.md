# Concept 06: Four kinds of state

“Put it in state” is incomplete advice. Ask who must observe the value and how long it must survive.

- URL state identifies workspace and product view; sharing the URL must reproduce it.
- Server state is fetched, cached, stale, and invalidated by query identity.
- Builder state is an unsaved local draft with domain transitions.
- Component state, such as preview width, is transient interaction detail.

Moving a value to the wrong owner creates synchronization work. A workspace ID hidden in component state cannot be shared; a preview-width toggle in the URL would create noise without user value.
