import type { FormPage } from "./flow.js";
import type { ResponseRecord } from "./responses.js";

export interface ResponseJourney {
  readonly id: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly lastPageId: string;
}

export interface PageDropoff {
  readonly pageId: string;
  readonly pageTitle: string;
  readonly count: number;
  readonly rate: number;
}

export interface AnalyticsReport {
  readonly started: number;
  readonly completed: number;
  readonly completionRate: number;
  readonly medianCompletionSeconds: number | null;
  readonly pageDropoff: readonly PageDropoff[];
}

export interface ChoiceMetric {
  readonly value: string;
  readonly count: number;
  readonly rate: number;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] ?? null : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function buildAnalyticsReport(journeys: readonly ResponseJourney[], pages: readonly FormPage[]): AnalyticsReport {
  const completed = journeys.filter((journey) => journey.completedAt !== undefined);
  const durations = completed.flatMap((journey) => {
    const duration = (Date.parse(journey.completedAt ?? "") - Date.parse(journey.startedAt)) / 1000;
    return Number.isFinite(duration) && duration >= 0 ? [duration] : [];
  });
  return {
    started: journeys.length,
    completed: completed.length,
    completionRate: journeys.length === 0 ? 0 : completed.length / journeys.length,
    medianCompletionSeconds: median(durations),
    pageDropoff: pages.map((page) => {
      const count = journeys.filter((journey) => journey.completedAt === undefined && journey.lastPageId === page.id).length;
      return { pageId: page.id, pageTitle: page.title, count, rate: journeys.length === 0 ? 0 : count / journeys.length };
    }),
  };
}

export function choiceBreakdown(responses: readonly ResponseRecord[], fieldId: string): readonly ChoiceMetric[] {
  const values = responses.flatMap((response) => typeof response.answers[fieldId] === "string" && response.answers[fieldId] ? [String(response.answers[fieldId])] : []);
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count, rate: values.length === 0 ? 0 : count / values.length })).sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

export const demoJourneys: readonly ResponseJourney[] = Array.from({ length: 24 }, (_, index) => {
  const startedAt = new Date(Date.UTC(2026, 6, 13, 7, index)).toISOString();
  if (index < 18) return { id: `journey-${index + 1}`, startedAt, completedAt: new Date(Date.parse(startedAt) + (45 + index * 7) * 1000).toISOString(), lastPageId: "consent" };
  return { id: `journey-${index + 1}`, startedAt, lastPageId: index < 21 ? "contact" : "role" };
});
