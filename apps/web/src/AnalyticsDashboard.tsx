import { buildAnalyticsReport, choiceBreakdown, type FormPage, type ResponseJourney, type ResponseRecord } from "@formforge/core";

function percent(rate: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(rate);
}

function duration(seconds: number | null) {
  if (seconds === null) return "Not enough data";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export function AnalyticsDashboard({ journeys, responses, pages }: { journeys: readonly ResponseJourney[]; responses: readonly ResponseRecord[]; pages: readonly FormPage[] }) {
  const report = buildAnalyticsReport(journeys, pages);
  const roles = choiceBreakdown(responses, "role");
  if (report.started === 0) return <section className="empty-boundary"><p className="eyebrow">Analytics</p><h2>No journeys yet</h2><p>Metrics will appear after the first form start.</p></section>;

  return (
    <section className="analytics-dashboard" aria-labelledby="analytics-heading">
      <div className="analytics-intro"><div><p className="eyebrow">Published form / v1</p><h2 id="analytics-heading">Response health</h2></div><p>All percentages name their denominator.</p></div>
      <div className="metric-grid">
        <article><span>Form starts</span><strong>{report.started}</strong><small>All recorded journeys</small></article>
        <article><span>Completions</span><strong>{report.completed}</strong><small>Finished journeys</small></article>
        <article><span>Completion rate</span><strong>{percent(report.completionRate)}</strong><small>{report.completed} of {report.started} starts</small></article>
        <article><span>Median completion</span><strong>{duration(report.medianCompletionSeconds)}</strong><small>Completed journeys only</small></article>
      </div>
      <div className="analytics-panels">
        <figure className="analytics-panel"><figcaption><strong>Drop-off by last page</strong><span>Share of all {report.started} starts</span></figcaption><div className="bar-chart" aria-hidden="true">{report.pageDropoff.map((page) => <div key={page.pageId}><span>{page.pageTitle}</span><div><i style={{ width: `${page.rate * 100}%` }} /></div><strong>{percent(page.rate)}</strong></div>)}</div><table><caption>Exact page drop-off values</caption><thead><tr><th scope="col">Page</th><th scope="col">Drop-offs</th><th scope="col">Share of starts</th></tr></thead><tbody>{report.pageDropoff.map((page) => <tr key={page.pageId}><th scope="row">{page.pageTitle}</th><td>{page.count}</td><td>{percent(page.rate)}</td></tr>)}</tbody></table></figure>
        <figure className="analytics-panel"><figcaption><strong>Role mix</strong><span>Share of answered role fields</span></figcaption><div className="bar-chart choice-chart" aria-hidden="true">{roles.map((role) => <div key={role.value}><span>{role.value}</span><div><i style={{ width: `${role.rate * 100}%` }} /></div><strong>{percent(role.rate)}</strong></div>)}</div><table><caption>Exact role response values</caption><thead><tr><th scope="col">Role</th><th scope="col">Responses</th><th scope="col">Share answered</th></tr></thead><tbody>{roles.map((role) => <tr key={role.value}><th scope="row">{role.value}</th><td>{role.count}</td><td>{percent(role.rate)}</td></tr>)}</tbody></table></figure>
      </div>
    </section>
  );
}
