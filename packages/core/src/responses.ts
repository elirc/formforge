import type { AnswerValue } from "./validation.js";

export interface ResponseRecord {
  readonly id: string;
  readonly submittedAt: string;
  readonly answers: Readonly<Record<string, AnswerValue | undefined>>;
}

export interface ResponseQuery {
  readonly search?: string;
  readonly sort: "newest" | "oldest";
  readonly cursor?: string;
  readonly limit: number;
}

export interface ResponsePage {
  readonly items: readonly ResponseRecord[];
  readonly nextCursor?: string;
  readonly total: number;
}

function compareIdentity(left: ResponseRecord, right: ResponseRecord) {
  const time = left.submittedAt.localeCompare(right.submittedAt);
  return time === 0 ? left.id.localeCompare(right.id) : time;
}

function cursorFor(response: ResponseRecord) {
  return encodeURIComponent(JSON.stringify([response.submittedAt, response.id]));
}

export function queryResponses(responses: readonly ResponseRecord[], query: ResponseQuery): ResponsePage {
  const term = query.search?.trim().toLocaleLowerCase() ?? "";
  const filtered = term ? responses.filter((response) => Object.values(response.answers).some((value) => String(value ?? "").toLocaleLowerCase().includes(term))) : [...responses];
  const sorted = filtered.sort((left, right) => (query.sort === "oldest" ? 1 : -1) * compareIdentity(left, right));
  const cursorIndex = query.cursor ? sorted.findIndex((response) => cursorFor(response) === query.cursor) : -1;
  const start = cursorIndex + 1;
  const items = sorted.slice(start, start + Math.max(1, query.limit));
  const hasMore = start + items.length < sorted.length;
  const last = items.at(-1);
  return hasMore && last ? { items, nextCursor: cursorFor(last), total: filtered.length } : { items, total: filtered.length };
}

export function escapeCsvCell(value: AnswerValue | string | undefined): string {
  let text = value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportResponsesCsv(responses: readonly ResponseRecord[], fieldIds: readonly string[]): string {
  const header = ["response_id", "submitted_at", ...fieldIds].map(escapeCsvCell).join(",");
  const rows = responses.map((response) => [response.id, response.submittedAt, ...fieldIds.map((fieldId) => response.answers[fieldId])].map(escapeCsvCell).join(","));
  return [header, ...rows].join("\r\n");
}

const roles = ["engineering", "design", "product"] as const;
export const demoResponses: readonly ResponseRecord[] = Array.from({ length: 18 }, (_, index) => ({
  id: `response-${String(index + 1).padStart(3, "0")}`,
  submittedAt: new Date(Date.UTC(2026, 6, 13, 8, index)).toISOString(),
  answers: {
    name: ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Lin Chen"][index % 4] ?? "Respondent",
    email: `respondent${index + 1}@example.com`,
    role: roles[index % roles.length] ?? "product",
    consent: index % 5 !== 0,
  },
}));
