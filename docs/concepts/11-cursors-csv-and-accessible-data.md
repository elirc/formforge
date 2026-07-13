# Concept 11: Cursors, CSV, and accessible data

Offset pagination says “skip N rows,” but N changes when new responses arrive. A cursor says “continue after this stable identity.” The sort must be total: timestamp alone is insufficient because two submissions may share it, so FormForge adds the response ID as a tie-breaker.

CSV is a serialization format, not string joining. Commas, quotes, and line breaks require quoting; quotes must double; spreadsheet formula prefixes need neutralization when files may be opened interactively.

A visual grid should remain a semantic table. Captions and column headers communicate relationships to assistive technology, while the small-screen CSS presents the same cells as labelled cards without changing the DOM’s tabular meaning.
