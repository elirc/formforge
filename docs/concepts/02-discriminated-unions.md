# Concept 02: Discriminated unions

A discriminated union models “one of these exact shapes.” Each field shares a `kind` property whose literal value lets TypeScript narrow the rest of the object. A `choice` field has options; an `email` field cannot accidentally receive them as meaningful configuration.

The renderer switches on `kind` and sends its default case to a function accepting `never`. When a future variant is added but not rendered, the compiler points at the missing contract. That is stronger than a loose object with dozens of optional properties.

Static types begin only after parsing. Zod checks JSON at runtime; TypeScript then preserves the relationship through domain and React code.
