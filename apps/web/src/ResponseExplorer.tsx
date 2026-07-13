import { exportResponsesCsv, queryResponses, type ResponseRecord } from "@formforge/core";
import { useState } from "react";

const pageSize = 6;

export function ResponseExplorer({ responses }: { responses: readonly ResponseRecord[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [pageCount, setPageCount] = useState(1);
  let cursor: string | undefined;
  const visible: ResponseRecord[] = [];
  let nextCursor: string | undefined;
  let total = 0;
  for (let pageNumber = 0; pageNumber < pageCount; pageNumber += 1) {
    const page = queryResponses(responses, cursor ? { search, sort, limit: pageSize, cursor } : { search, sort, limit: pageSize });
    visible.push(...page.items);
    nextCursor = page.nextCursor;
    total = page.total;
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  const exportPage = queryResponses(responses, { search, sort, limit: Math.max(1, responses.length) });
  const csv = exportResponsesCsv(exportPage.items, ["name", "email", "role", "consent"]);
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <section className="response-explorer" aria-labelledby="responses-heading">
      <div className="response-summary"><div><p className="eyebrow">Submission inbox</p><h2 id="responses-heading">{total} responses</h2></div><a className="export-action" href={csvHref} download="customer-research-responses.csv">Export CSV</a></div>
      <div className="response-filters">
        <label>Search responses<input type="search" value={search} onChange={(event) => { setSearch(event.currentTarget.value); setPageCount(1); }} placeholder="Name, email, role…" /></label>
        <label>Sort<select value={sort} onChange={(event) => { setSort(event.currentTarget.value as "newest" | "oldest"); setPageCount(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      </div>
      {visible.length === 0 ? <div className="empty-boundary"><h3>No matching responses</h3><p>Try a broader search term.</p></div> : <div className="response-table-wrap"><table><caption>Published form responses</caption><thead><tr><th scope="col">Submitted</th><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Consent</th></tr></thead><tbody>{visible.map((response) => <tr key={response.id}><td data-label="Submitted"><time dateTime={response.submittedAt}>{new Date(response.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" })} UTC</time></td><td data-label="Name">{String(response.answers.name ?? "—")}</td><td data-label="Email">{String(response.answers.email ?? "—")}</td><td data-label="Role"><span className="role-pill">{String(response.answers.role ?? "—")}</span></td><td data-label="Consent">{response.answers.consent ? "Yes" : "No"}</td></tr>)}</tbody></table></div>}
      {nextCursor && <button className="load-more" type="button" onClick={() => setPageCount((count) => count + 1)}>Load more responses</button>}
    </section>
  );
}
