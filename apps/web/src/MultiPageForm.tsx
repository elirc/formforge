import { answerSession, backSession, nextSession, resumeSession, serializeSession, startSession, type AnswerValue, type FormFlow, type FormSchema, type ResponseSession } from "@formforge/core";
import { useEffect, useState } from "react";
import { FormRenderer } from "./FormRenderer.js";

function loadSession(flow: FormFlow, storageKey: string): ResponseSession {
  const stored = window.localStorage.getItem(storageKey);
  return stored ? resumeSession(flow, stored) ?? startSession(flow) : startSession(flow);
}

export function MultiPageForm({ schema, flow, storageKey = `formforge:response:${schema.id}` }: { schema: FormSchema; flow: FormFlow; storageKey?: string }) {
  const [session, setSession] = useState(() => loadSession(flow, storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, serializeSession(session));
  }, [session, storageKey]);

  if (session.completed) {
    return <section className="flow-complete"><p className="eyebrow">Response saved locally</p><h2>Response complete</h2><p>Thanks for taking the time to share your perspective.</p><button type="button" onClick={() => setSession(startSession(flow))}>Start over</button></section>;
  }

  const pageIndex = flow.pages.findIndex((page) => page.id === session.currentPageId);
  const page = flow.pages[pageIndex];
  if (!page) throw new Error(`Missing page ${session.currentPageId}.`);
  const pageSchema: FormSchema = { ...schema, title: page.title, fields: schema.fields.filter((field) => page.fieldIds.includes(field.id)) };

  function advance(pageAnswers: Readonly<Record<string, AnswerValue | undefined>>) {
    let answered = session;
    for (const [fieldId, value] of Object.entries(pageAnswers)) {
      if (value !== undefined) answered = answerSession(answered, fieldId, value);
    }
    setSession(nextSession(flow, answered));
  }

  return (
    <section className="multi-page-form" aria-label="Multi-page form demo">
      <div className="flow-progress"><span>Step {pageIndex + 1} of {flow.pages.length}</span><progress aria-label="Form progress" max={flow.pages.length} value={pageIndex + 1} /></div>
      <p className="resume-note">Progress is saved on this device.</p>
      <FormRenderer key={session.currentPageId} schema={pageSchema} initialAnswers={session.answers} onValidSubmit={advance} submitLabel={pageIndex === flow.pages.length - 1 ? "Complete form" : "Continue"} />
      <button className="back-action" type="button" disabled={session.visitedPageIds.length < 2} onClick={() => setSession((current) => backSession(current))}>Back</button>
    </section>
  );
}
