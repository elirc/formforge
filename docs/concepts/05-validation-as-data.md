# Concept 05: Validation as data

Validation is more useful when it returns structured data instead of throwing or directly changing the UI. Schema issues contain a code, message, and optional field identity. Response errors map field identity to a message.

React turns that data into publish state, an error summary, `aria-invalid`, and field messages. The domain code does not know about DOM focus or CSS, while the component does not reimplement email, range, or required rules.

Client validation improves feedback; it is not a trust boundary. Sprint 10 will run the same response contract after parsing a public request on the server.
