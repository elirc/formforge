import { diffFormSchemas, parseMentions, type CollaborationComment, type FormSchema } from "@formforge/core";
import { useState, type FormEvent } from "react";

export type CreateComment = (body: string) => Promise<CollaborationComment>;
type CommentView = CollaborationComment & { readonly pending?: boolean };

export const demoComments: readonly CollaborationComment[] = [
  { id: "comment-demo-1", workspaceId: "acme", formId: "customer-research", author: "Maya", body: "@eli The consent wording is much clearer in this version.", mentions: ["eli"], createdAt: "2026-07-13T14:00:00.000Z" },
];

export function CommentsPanel({ initialComments = demoComments, createComment = async (body) => Promise.resolve({ id: `comment-${Date.now()}`, workspaceId: "acme", formId: "customer-research", author: "Eli", body, mentions: parseMentions(body), createdAt: new Date().toISOString() }) }: { initialComments?: readonly CollaborationComment[]; createComment?: CreateComment }) {
  const [comments, setComments] = useState<readonly CommentView[]>(initialComments);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    const temporaryId = `pending-${Date.now()}`;
    const optimistic: CommentView = { id: temporaryId, workspaceId: "acme", formId: "customer-research", author: "You", body: text, mentions: parseMentions(text), createdAt: new Date().toISOString(), pending: true };
    setComments((current) => [...current, optimistic]);
    setBody("");
    setError("");
    try {
      const saved = await createComment(text);
      setComments((current) => current.map((comment) => comment.id === temporaryId ? saved : comment));
    } catch {
      setError("Comment failed to send. Try again.");
    }
  }

  return <section className="comments-panel" aria-labelledby="comments-heading"><div className="panel-heading"><div><p className="eyebrow">Async collaboration</p><h3 id="comments-heading">Comments</h3></div><span>{comments.length}</span></div><ol>{comments.map((comment) => <li key={comment.id}><div className="comment-meta"><strong>{comment.author}</strong><time dateTime={comment.createdAt}>{comment.pending ? "Sending…" : new Date(comment.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC"}</time></div><p>{comment.body}</p>{comment.mentions.length > 0 && <div className="mention-list" aria-label="Mentioned teammates">{comment.mentions.map((mention) => <span key={mention}>@{mention}</span>)}</div>}</li>)}</ol><form onSubmit={submit}><label htmlFor="comment-body">Add a comment</label><textarea id="comment-body" value={body} onChange={(event) => setBody(event.currentTarget.value)} placeholder="Ask for feedback and mention @teammates" /><div><span className="comment-error" role="alert">{error}</span><button type="submit">Comment</button></div></form></section>;
}

export function VersionHistory({ current }: { current: FormSchema }) {
  const originalName = current.fields.find((field) => field.id === "name");
  const previous: FormSchema = { ...current, title: "Customer discovery draft", fields: current.fields.filter((field) => field.id !== "consent").map((field) => field.id === originalName?.id ? { ...field, label: "Name" } : field) };
  const changes = diffFormSchemas(previous, current);
  return <section className="history-panel" aria-labelledby="history-heading"><div className="panel-heading"><div><p className="eyebrow">Immutable publication</p><h3 id="history-heading">Version history</h3></div><span>v2</span></div><div className="version-track"><article><strong>Version 2</strong><time dateTime="2026-07-13T15:00:00Z">Current</time><p>Published after collaboration review.</p></article><article><strong>Changes from v1</strong><ul>{changes.map((change) => <li key={`${change.kind}-${change.fieldId ?? "form"}`}>{change.summary}</li>)}</ul></article><article><strong>Version 1</strong><time dateTime="2026-07-13T12:00:00Z">Earlier today</time><p>Initial public snapshot.</p></article></div></section>;
}

export function CollaborationPanel({ schema }: { schema: FormSchema }) {
  return <div className="collaboration-grid"><CommentsPanel /><VersionHistory current={schema} /></div>;
}
