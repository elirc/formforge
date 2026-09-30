# 02 — The identities hidden inside a simple form builder

[Course home](README.md) · [Previous: map](01-CODEBASE-MAP.md) · [Next: worked change](03-WORKED-CHANGE.md)

## TypeScript and runtime validation answer different questions

`FormSchema` describes what checked TypeScript code expects. An HTTP caller does not run your compiler. `parseFormSchema` turns unknown input into a validated shape using a discriminated union on `kind`: a choice field needs options, a checkbox needs consent text, and a content block has different rules from an answerable field.

A runtime-valid body can still disagree with its route. Suppose the URL says `/forms/a/draft`, while the body contains a valid schema with `id: "b"`. Both strings are valid individually. The new cross-field check rejects their relationship before writing. Validation includes relationships and invariants, not just checking every property in isolation.

For a contacts app, the analogous bug is updating `/contacts/alice` using a body that quietly identifies Bob. Choose one authoritative resource identity, verify agreement where duplicate identities exist, and test that a rejected request leaves both records unchanged.

## Slug, form ID, publication ID and version are not interchangeable

| Value | Meaning | Example |
|---|---|---|
| Workspace + form ID | The editable form's owner/identity | `acme` + `customer-research` |
| Slug | A public address reserved by that owner | `research-2026` |
| Publication version | Sequence within one form's history | 1, 2, 3 |
| Publication ID | One immutable snapshot | An opaque UUID |
| Submission idempotency key | One attempted response to a snapshot | A caller-retained request token |

The old repository counted versions within each slug. Publishing one form under a new slug restarted its version at 1 and reconstructed the same publication ID. The submission repository then saw two supposed snapshots as one idempotency namespace. A change that looked like URL naming affected response persistence downstream.

The repair assigns versions from a workspace/form history and gives every snapshot an independent UUID. The submission key remains scoped by publication ID, so distinct snapshots now remain distinct even if a respondent uses the same caller token. This fixes that identity collision; it does not add payload-equivalence checking for two submissions to the same snapshot.

## Compound keys need an unambiguous representation

The form-history map uses `JSON.stringify([workspaceId, formId])`. This preserves the boundary between the components. Simple concatenation with `:` would make pairs such as `("a:b", "c")` and `("a", "b:c")` look identical unless the delimiter were forbidden or escaped.

The map key is an internal representation, while the public snapshot ID is opaque. Do not parse business facts back out of an opaque ID. Keeping those concerns separate allows identity format to change without requiring every client to understand internal naming rules.

## Immutable snapshots protect historical meaning

A draft can change. A published snapshot represents what respondents saw at a point in time. Mutating that same object later would make old answers appear to belong to a new question schema. The repository uses `structuredClone` when storing and returning publications so a caller cannot mutate stored history through a shared object reference.

Immutability is not the same as freezing every object in the program. Here the important guarantee is that callers do not hold the stored instance. A future durable adapter obtains a similar separation through serialized rows/documents, but it must still define whether history can be updated or deleted.

Try this prediction: publish a form, modify the returned object's title, then read the slug. The stored title should remain unchanged. Next publish a revised title under a different slug. The old slug should still return its own earlier snapshot; the new slug returns the later one.

## Check-and-write must be one consistency boundary

The in-memory publication method checks the slug owner and writes both maps without an intervening `await`. Within one Node process, another JavaScript request cannot interleave in the middle of that synchronous section. That is the relevant guarantee; declaring the method `async` does not itself create or remove atomicity.

When moving to a database, an early availability check followed by a later insert can race. Reserve a slug using an appropriate unique constraint/transaction and map conflicts into the same public contract. Multiple independent Node processes do not share these maps. Never describe this memory implementation as a distributed ownership service.

## Debounce, serialization and stale-result protection solve different problems

Debounce waits for an editing pause before scheduling a save. It reduces how many requests are attempted. Serialization waits for the previous save so the next save can use its committed version. Stale-result protection prevents an older result from replacing the visible state of a newer edit.

None of the three replaces the others. A debounced request can still overlap a slow previous request. A serialized queue can still display an old “saved” message while a newer edit is waiting for its timer. A UI revision guard cannot make a server-side lost update impossible without an actual concurrency contract.

```text
t=0     edit A
t=300   save A starts
t=400   edit B; B is queued locally
t=500   A succeeds
t=700   B's debounce ends; save B uses A's committed version
```

At t=500, the status must still describe B as queued. A's successful version must nevertheless update the version ref, or B would be sent with a stale expected version. The correct response handling updates committed-version knowledge while ignoring an obsolete status message. Discarding the entire old result would also be wrong.

## `useRef` is not a substitute for all state

The hook keeps server version, promise queue and revision counters in refs because they must survive renders without independently rendering UI. The visible status uses state because React must render it. Putting everything in state can create unnecessary effects; putting everything in refs can leave the screen stale.

Trace a ref by who reads it and when. “Refs do not rerender” is only the start of the explanation. In this hook, `version.current` is read when the queued save actually starts, which is why it can reflect the preceding commit.

## A workspace header is not authentication

The publishing route compares a caller-supplied `x-workspace-id` to the URL. That demonstrates a boundary check but does not prove who the caller is. A real permission check must derive identity from trusted authentication and verify access to the workspace/form. Keep this separate from the slug invariant: even authorized users should not accidentally replace another form's public address.

Explain the distinction using a ticketing app: checking that a ticket belongs to workspace A does not prove that the current user belongs to workspace A. Data relationships and caller permissions need separate evidence.
