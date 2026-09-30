# 37. Executable submission scope laboratory

This chapter adds a small runnable educational model for the publication-scoped retry behavior discussed earlier. It is deliberately separate from the application and imports no API, database, browser, or workspace package. Read [the model](labs/submission-scope-model.cjs) and [its six checks](labs/submission-scope-model.test.cjs), then compare them with [submissions.ts](../../packages/data/src/submissions.ts). The [separate review](review-13-models-and-adapter-evidence.md) explains the exercises.

## Run only the owned model

From this extended-course directory, the bounded command is:

```sh
node --test labs/submission-scope-model.test.cjs
```

It uses Node's built-in test runner and does not install packages, start a server, read application data, or modify learner answers. A successful result establishes the six stated model properties. It does not run FormForge's application suites or prove the Fastify route, database concurrency, or browser behavior. Keep that scope in your lab notebook.

The model state contains a next sequence and an array of entries. submit returns a state/result pair. A false valid argument produces rejected before lookup. Otherwise, it derives a publication/key scope, returns a cloned existing submission for a duplicate, or creates a detached answer snapshot and a new state. The valid flag stands in for earlier route validation; it does not parse or validate an actual FormSchema.

## Read the intentional differences

The production fixture repository is asynchronous and stores records in a private Map, while the model is a synchronous immutable transition function. The model omits submittedAt and uses model-prefixed IDs. It uses JSON tuple encoding for scope rather than the repository's null-separated string. These differences are documented because an educational model should not quietly claim exact implementation equivalence.

The tuple difference lets the final check demonstrate an identity lesson: if arbitrary component strings can contain a delimiter, simple concatenation can collapse distinct pairs. The check uses synthetic strings containing a null separator and verifies the model keeps the pairs distinct. It does not claim that a particular HTTP route currently admits those exact values or that an end-to-end exploit has been demonstrated. The supported conclusion is about tuple encoding under unrestricted model inputs.

The first-wins behavior, publication scope, early validation order, and copy isolation are the core ideas mirrored from the source paths. The model makes them easy to manipulate without creating a server or changing runtime code. Its narrowness is an advantage when used honestly: every state transition can be inspected, and every omitted boundary remains visible.

## Work the changed-payload replay

Start from initial state and submit P1, attempt-1, name Ada. The result is created and state contains one entry. Submit the same publication/key with name Grace. The model finds the existing scope and returns duplicate with Ada. It does not increment next or compare the new answers. The result demonstrates current first-wins semantics rather than a fingerprint-conflict proposal.

Now change only the publication to P2. The same key creates another entry. This is the mechanism behind the republish retry race: an unchanged client key does not preserve operation identity when the publication scope changes. The model does not resolve a slug, so you supply P1 and P2 explicitly. An API characterization would need to publish both versions and retry through the slug route to cross that additional boundary.

Set valid false on a duplicate attempt. The model rejects before lookup. This captures the ordering lesson that route validation can prevent repository replay. It does not mean every invalid request has the same HTTP code or error body; those details belong to the real adapter and its parser.

## Copy isolation and observation

The first check mutates both the original request answers and the returned result answers after creation. The stored model entry remains Ada. This verifies two ownership boundaries in the model: input snapshotting and result detachment. A shallow copy of the outer submission would be insufficient if nested answer structures were introduced later, so the use of structuredClone should be reviewed alongside the intended answer type.

The immutable-state check separately verifies that creating a new operation does not modify the previous state's empty entries or sequence. The model's stored entries are still ordinary JavaScript objects; callers who reach directly into state can mutate them. The test does not claim deep freezing or hostile-caller protection. In the application, the private repository field and cloned public results provide a different encapsulation boundary.

This distinction is important for model design. Immutability by convention, defensive copies, readonly types, private fields, and runtime freezing solve related but different problems. Do not use one passing copy test to claim every object in the system is immutable under arbitrary access.

## Extend the model deliberately

Your independent extension is to add a strict fingerprint policy in a new learner-owned file, leaving the reference model and checks unchanged. The extended result can distinguish duplicate from payload_conflict. Define canonical answers first, including missing versus empty and boolean versus string. Then add checks that equivalent key ordering replays and a changed semantic value conflicts.

Next add an explicit expired-receipt state or retention boundary. Decide what an old retry returns when its result is no longer retained. Do not simply delete entries and claim the same guarantee continues forever. The exercise should expose how retention changes the operation contract.

Keep storage and authentication out of this first extension. They are separate adapters with separate evidence requirements. A small correct model can later guide a durable implementation, but adding a fake database-shaped object does not by itself test transactions or authorization.

## Exercises

**FF-37A, eight points:** Run or inspect the six checks and map each to a source concept and a model-only assumption. Explain the tuple-encoding difference without claiming an untested HTTP vulnerability.

**FF-37B, six points:** Trace changed-payload replay, changed-publication creation, and early rejection. Identify the additional real API steps needed to characterize the republish race through a slug.

**FF-37C, six points:** Specify a learner-owned strict-fingerprint extension and retention rule. Name the new outcomes, canonicalization decisions, and checks while preserving the reference model and avoiding runtime imports.

## Exit evidence

The lab is complete when you can explain both what passed and what was never exercised. A useful educational model makes a contract falsifiable. It becomes misleading only when its convenient simplifications are promoted into unearned claims about the application or infrastructure.
