# Review 07. Models, operational boundaries, and API evidence

## FF-16A: update knowledge without lying about current work

Old saved result advances committed but leaves queued status after a newer edit. Old conflict changes neither committed nor the latest status. Latest conflict becomes visible while committed stays at its last accepted value. Award four points for the ledger and four for explaining separate authorities. The model omits queue scheduling, so arbitrary result orders are not automatically valid hook schedules.

## FF-16B: one extension should expose one wrong policy

A session-identity extension should demonstrate that an old form's result cannot change the new form's committed version. A queue extension should show the next callback reads version at execution. An uncertainty extension should distinguish known rejection from possible acceptance with lost response. Award two points for invariant, two for counterexample, two for preserving reference and scope.

## FF-16C: a model is one rung

Map edit sequence, successful-version assignment, and status ownership to the hook. Mark timers, promise serialization, React lifecycle, schema storage, and HTTP behavior as omitted. The next rungs are focused hook tests and real adapter/component evidence. Award three points for mapping and three for at least three precise non-guarantees.

## FF-17A: probe semantics follow the injected function

True yields ready; false, throw, or rejection yield 503 not_ready. Liveness remains its independent ok response. The default readiness function returns true and does not inspect actual dependencies. Award four points for outcomes and four for scope. An operator needs the configured probe's meaning, not only its route name.

## FF-17B: correlation is caller-influenced

Accepted strings within the character/length rule are retained. Missing or invalid values cause generated UUIDs. Repeated valid ids can be retained on multiple requests. The value is neither proof of principal identity nor an automatically trusted operation key. Award three points for the table and three for those distinctions.

## FF-17C: telemetry needs its own failure contract

Use distinctive synthetic body and query markers, capture events, and assert only intended fields are present. Inject a sink that throws and observe the actual framework behavior in an owned test before proposing isolation or buffering. A void callback and JSON serializer do not provide persistence, delivery retry, or exactly-once logging. Award three points for evidence design and three for the proposed reliability contract.

## FF-18A: read assertions before trusting a name

Identity disagreement plus follow-up 404 supports rejected requests leaving no accessible default-store record. Header agreement supports that comparison, not real account authorization. A malformed draft containing negative expectedVersion may reject before schema parsing. Award four points for three bounded claims and four for the hidden-coverage example and stronger nonclaims.

## FF-18B: contracts and storage mechanisms complement each other

A shared suite should assert saved/conflict behavior, retained state, deep result ownership, slug reservation, and duplicate receipt identity through the repository interface. A durable-specific test needs actual competing storage actors for initial insert and conditional update races. Fake responses cannot prove uniqueness or transaction isolation. Award three points for shared behavior and three for mechanism evidence.

## FF-18C: each assertion should kill a plausible mutation

Mismatched schema ids must not reach storage; another form in the same workspace must not take an owned slug; stale saves must preserve winner/version; duplicates must retain receipt and map to the documented response. Award one point per mutation pair and two for separating designed tests from executed results. A test plan is valuable, but its pass count remains pending until run.

These nine exercises add one hundred eighty points. Return to [the route](README.md) with your model receipt, probe dictionary, and test-boundary ledger.
