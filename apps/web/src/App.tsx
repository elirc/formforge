import { demoForm, demoFormFlow, demoJourneys, demoResponses, demoVisibilityRules, demoWorkspace, productCards, workspaceQueryKey, type Workspace } from "@formforge/core";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { FormBuilder } from "./FormBuilder.js";
import { FormRenderer } from "./FormRenderer.js";
import { MultiPageForm } from "./MultiPageForm.js";
import { ResponseExplorer } from "./ResponseExplorer.js";
import { AnalyticsDashboard } from "./AnalyticsDashboard.js";
import { CollaborationPanel } from "./CollaborationPanel.js";
import { AutosaveStatus, useAutosave, type DraftSaver } from "./useAutosave.js";

function HomePage() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="FormForge home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FormForge</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/workspaces/$workspaceId/$view" params={{ workspaceId: "acme", view: "builder" }}>Forms</Link>
          <Link to="/workspaces/$workspaceId/$view" params={{ workspaceId: "acme", view: "responses" }}>Responses</Link>
          <Link to="/workspaces/$workspaceId/$view" params={{ workspaceId: "acme", view: "analytics" }}>Analytics</Link>
        </nav>
        <button className="avatar" type="button" aria-label="Open account menu">AE</button>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Workspace / Acme Research</p>
            <h1 id="page-title">Build forms people enjoy answering.</h1>
            <p className="hero-copy">Create a typed, accessible experience. Publish with confidence and learn from every response.</p>
          </div>
          <Link className="primary-action" to="/workspaces/$workspaceId/$view" params={{ workspaceId: "acme", view: "builder" }}>Create a form <span aria-hidden="true">→</span></Link>
        </section>

        <section id="forms" className="section" aria-labelledby="workspace-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h2 id="workspace-heading">Everything in one deliberate flow</h2>
            </div>
            <span className="status"><span aria-hidden="true" /> All systems ready</span>
          </div>

          <div className="card-grid">
            {productCards.map((card, index) => (
              <article className="product-card" key={card.area} id={card.area}>
                <div className="card-number" aria-hidden="true">0{index + 1}</div>
                <div>
                  <p className="card-status">{card.status}</p>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <Link to="/workspaces/$workspaceId/$view" params={{ workspaceId: "acme", view: card.area }} aria-label={`Open ${card.title}`}>Explore <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="builder-section" aria-labelledby="builder-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Authoring studio</p><h2 id="builder-heading">Shape the form, see the result.</h2></div>
            <p className="section-intro">Canonical reducer state drives the structure, settings, and preview without duplicated truth.</p>
          </div>
          <FormBuilder />
        </section>

        <section className="renderer-stage" aria-labelledby="renderer-heading">
          <div className="renderer-copy">
            <p className="eyebrow">Typed by design</p>
            <h2 id="renderer-heading">One schema. Every control accounted for.</h2>
            <p>The field discriminant connects authoring data to an exhaustive React renderer. Invalid variants stop at the runtime boundary.</p>
            <dl>
              <div><dt>7</dt><dd>field variants</dd></div>
              <div><dt>1</dt><dd>exhaustive contract</dd></div>
            </dl>
          </div>
          <FormRenderer schema={demoForm} />
        </section>

        <section className="boundary-grid" aria-label="Workspace status">
          <article>
            <p className="eyebrow">Next lesson</p>
            <h2>Typed schema renderer</h2>
            <p>Model field variants so the compiler keeps every renderer honest.</p>
          </article>
          <article className="dark-card">
            <p className="eyebrow">Learning signal</p>
            <strong>Strict by default</strong>
            <p>Compiler, tests, and build share one repeatable gate.</p>
          </article>
        </section>
      </main>

      <footer>
        <span>FormForge</span>
        <span>Made to teach product engineering.</span>
      </footer>
    </div>
  );
}

export async function loadWorkspace(workspaceId: string): Promise<Workspace | undefined> {
  await Promise.resolve();
  if (workspaceId === "error") throw new Error("Workspace service unavailable");
  return workspaceId === demoWorkspace.id ? demoWorkspace : undefined;
}

function WorkspaceBuilder({ workspaceId, initialSchema }: { workspaceId: string; initialSchema: typeof demoForm }) {
  const [schema, setSchema] = useState(initialSchema);
  const serverVersion = useRef(0);
  const save = useCallback<DraftSaver>(async (_nextSchema, expectedVersion) => {
    await Promise.resolve();
    if (expectedVersion !== serverVersion.current) {
      return { status: "conflict", serverVersion: serverVersion.current };
    }
    serverVersion.current += 1;
    return { status: "saved", version: serverVersion.current };
  }, [workspaceId]);
  const autosave = useAutosave(schema, save);

  return <><div className="workspace-savebar"><span>Draft / {initialSchema.title}</span><AutosaveStatus state={autosave} /></div><FormBuilder initialSchema={initialSchema} onSchemaChange={setSchema} rules={demoVisibilityRules} /><div className="flow-demo"><div><p className="eyebrow">Respondent journey</p><h2>Branching, resumable form</h2></div><MultiPageForm schema={initialSchema} flow={demoFormFlow} storageKey={`formforge:demo:${workspaceId}`} /></div><CollaborationPanel schema={schema} /></>;
}

function WorkspacePage() {
  const { workspaceId, view } = workspaceRoute.useParams();
  const workspace = useQuery({ queryKey: workspaceQueryKey(workspaceId), queryFn: () => loadWorkspace(workspaceId) });
  if (workspace.isPending) return <main className="route-boundary" aria-busy="true"><p className="eyebrow">Loading workspace</p><h1>Opening the studio…</h1></main>;
  if (workspace.isError) return <main className="route-boundary"><p className="eyebrow">Unable to load</p><h1>Workspace temporarily unavailable</h1><p>Try again after checking the API boundary.</p></main>;
  if (!workspace.data) return <main className="route-boundary"><p className="eyebrow">Not found</p><h1>That workspace does not exist</h1><Link to="/">Return home</Link></main>;

  const knownView = view === "builder" || view === "responses" || view === "analytics";
  if (!knownView) return <main className="route-boundary"><p className="eyebrow">Not found</p><h1>That workspace view does not exist</h1></main>;

  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#workspace-main">Skip to content</a>
      <header className="workspace-topbar">
        <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">F</span><span>FormForge</span></Link>
        <div><strong>{workspace.data.name}</strong><small>{workspace.data.plan} plan</small></div>
        <nav aria-label="Workspace navigation">
          {(["builder", "responses", "analytics"] as const).map((item) => <Link key={item} to="/workspaces/$workspaceId/$view" params={{ workspaceId, view: item }} activeProps={{ "aria-current": "page" }}>{item === "builder" ? "Builder" : item[0]?.toUpperCase() + item.slice(1)}</Link>)}
        </nav>
      </header>
      <main id="workspace-main" className="workspace-main">
        <div className="route-heading"><div><p className="eyebrow">Workspace / {workspace.data.name}</p><h1>{view === "builder" ? workspace.data.forms[0]?.title ?? "New form" : view}</h1></div><Link to="/">Back to overview</Link></div>
        {view === "builder" && workspace.data.forms[0] && <WorkspaceBuilder workspaceId={workspaceId} initialSchema={workspace.data.forms[0]} />}
        {view === "responses" && <ResponseExplorer responses={demoResponses} />}
        {view === "analytics" && <AnalyticsDashboard journeys={demoJourneys} responses={demoResponses} pages={demoFormFlow.pages} />}
      </main>
    </div>
  );
}

function PublicFormPage() {
  const { slug } = publicRoute.useParams();
  const [receipt, setReceipt] = useState<string>();
  if (slug !== demoForm.id) return <main className="route-boundary"><p className="eyebrow">Public form</p><h1>That form is not published</h1><Link to="/">Return home</Link></main>;
  return <main className="public-form-shell"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">F</span><span>FormForge</span></Link><p className="public-version">Published snapshot v1</p><FormRenderer schema={demoForm} onValidSubmit={() => setReceipt("demo-receipt-001")} />{receipt && <div className="submission-receipt" role="status"><strong>Response received</strong><span>Receipt {receipt}</span></div>}</main>;
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const workspaceRoute = createRoute({ getParentRoute: () => rootRoute, path: "/workspaces/$workspaceId/$view", component: WorkspacePage });
const publicRoute = createRoute({ getParentRoute: () => rootRoute, path: "/f/$slug", component: PublicFormPage });
const routeTree = rootRoute.addChildren([homeRoute, workspaceRoute, publicRoute]);
export const appRouter = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof appRouter }
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });

export function App() {
  return <QueryClientProvider client={queryClient}><RouterProvider router={appRouter} /></QueryClientProvider>;
}
