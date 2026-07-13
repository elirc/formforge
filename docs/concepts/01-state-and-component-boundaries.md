# Concept 01: State and component boundaries

React components should be divided by responsibility, not by the number of visible boxes on a mockup. A component earns state when it owns a user interaction that cannot be derived from its inputs. Everything else starts as props or derived values.

The Sprint 1 shell is deliberately almost stateless. Navigation, product cards, and status copy are data or structure; introducing hooks would create extra sources of truth without a behavior to own. Later sprints add reducer state only when the builder has real transitions.

TypeScript makes a component contract searchable and reviewable, but it cannot validate untrusted network data. The course keeps compile-time component types and runtime boundary parsing as separate responsibilities.
