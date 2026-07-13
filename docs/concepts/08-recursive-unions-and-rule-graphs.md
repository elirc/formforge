# Concept 08: Recursive unions and rule graphs

A conditional expression is a tree: comparisons are leaves, while `all` and `any` nodes contain more expressions. A recursive TypeScript union mirrors that shape, so the evaluator handles each variant explicitly and calls itself for children.

Visibility dependencies form a different shape: a directed graph from a controlled field to the fields it reads. Valid node IDs do not guarantee a valid graph. Direct self-reference is easy to spot; longer cycles require traversal with visiting and visited sets.

Keep evaluation pure. React collects live answers and renders the derived visible field list, while the core package decides what a rule means. This division lets property tests exercise rule truth tables without a browser.
