# Review 06. Browser storage and optimistic boundaries

## FF-13A: asynchronous syntax does not identify a data source

Hint: follow the function supplied to useQuery or the component prop until you find its side effect.

Workspace load returns demoWorkspace after a resolved promise. The builder saver compares and advances a local ref but does not store its schema argument. Public submission sets a fixed demo receipt. VersionHistory synthesizes a previous schema rather than loading repository history. Comments use an injectable callback whose default constructs a local result. Award five points for sources and three for limits.

The presence of real API repositories elsewhere does not connect them to these call sites. An integration plan should upgrade one explicit boundary and leave the remaining demonstration claims visible until their own adapters are implemented.

## FF-13B: a fresh read needs independent state

Load a draft through the selected adapter, save a changed nested field with the accepted version, discard the component's local state, and read again through the storage boundary. The final assertion should inspect the freshly returned schema and version. A component state variable compared with itself proves nothing about persistence.

Award three points for the independent read and three for clear scope. Browser refresh against one running in-memory server differs from server restart. A durable adapter adds another milestone and needs its own failure evidence.

## FF-13C: diagnose the actual seam first

The disappearing-edit incident begins with the demo saver ignoring _nextSchema. There is no need to invent a database rollback explanation. A bounded repair can connect real draft load/save and describe refresh survival while retaining the server-restart limitation of in-memory storage. Award three points for diagnosis and three for accurate milestone wording.

A useful user-facing statement names the achieved behavior without claiming account authorization or durable storage prematurely. The course's purpose is to make that boundary reviewable, not to shame a deliberate demonstration.

## FF-14A: initialization differs from prop updates

Initial state loads from the current key. Invalid serialized content under resumeSession's checks falls back to a new session. getItem exceptions occur outside that helper's catch. Changing storageKey on the same mounted component does not rerun the lazy initializer, while the effect can write existing session state under the changed key.

Award two points per case. A real impact claim additionally needs the parent lifecycle path. The characterization test can establish the component contract without asserting that every current navigation triggers it.

## FF-14B: membership and order are separate

pageSchema filters schema.fields by membership in page.fieldIds, preserving schema order. Undefined page answers are skipped during merging, so they do not explicitly erase existing values. A proposal should choose one ordering authority and an explicit clear operation or value semantics. Award three points for each boundary.

Do not change both silently in an integration refactor. Reordering controls or resurrecting stale answers can alter respondent behavior even when the page still renders successfully.

## FF-14C: test both lifetimes deliberately

Rerender the same component with another storage key and compare with a keyed remount. Observe storage reads/writes and visible page, restoring the storage mock afterward. An adaptive progress proposal should state whether it reports configured position, visited milestones, or estimated remaining path. Award three points for lifetime evidence and three for the progress contract.

Branching can make configured step two complete early. A percentage should not promise a fixed remaining workload unless its calculation and wording support that promise.

## FF-15A: functional updates still need unique identities

With distinct temporary ids, reversed completion replaces each matching pending row while preserving unrelated comments. With a fixed identical Date.now value, two temporary rows can share an id and one completion can replace both. Award four points for the ordinary schedule and four for the collision characterization and proposed identity fix.

The fixture establishes a possible contract failure under that schedule, not its production frequency. A scoped counter or injected UUID generator can make the intended local attempt identity explicit and testable.

## FF-15B: failed text and newer draft are both user work

After A submits, body clears. The user types B. A's rejection currently restores A into body and can overwrite B. A stronger proposal can keep A as a failed retry row while retaining B in the composer, or offer explicit recovery without automatic replacement. Award three points for the current trace and three for preserving both values in the proposal.

A recovery policy must also handle two failures and a user who has already submitted B. Attempt ownership should govern transitions, not a blanket rule that every failure rewrites the current composer.

## FF-15C: storage, identity, and delivery need separate contracts

A trusted adapter derives author and permitted workspace/form from authenticated context, retains a stable attempt key for retries, and returns a server comment identity. The existing repository supplies trimming, scoped listing by supplied ids, and defensive copies, but no authentication or retry key. Mention delivery needs separate durable intent and duplicate handling if implemented.

Award two points for each layer. The panel's optimistic state is not a notification queue, and parseMentions does not send anything. A fake-adapter lab can test uncertainty without contacting external recipients.

These nine exercises add one hundred eighty possible points. Return to [the course index](README.md) with a source map that labels demonstration, local persistence, and proposed server integration separately.
