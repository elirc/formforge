# Concept 09: State machines and resume

A multi-page form is not “an index plus some conditionals.” Its meaningful states include the current page, accumulated answers, actual visit history, and completion. Transitions accept one valid state and return the next.

Branch order is product behavior. FormForge chooses the first matching branch and otherwise advances to the next declared page. Back follows visit history because a respondent may never have visited the previous array element.

Serialized browser data is untrusted input. A resume boundary parses JSON, checks page identities and value shapes, and falls back safely when the flow changed. Persistence is useful only when recovery is predictable.
