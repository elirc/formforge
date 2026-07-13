import { evaluateRule, type ConditionRule } from "./rules.js";
import type { AnswerValue } from "./validation.js";

export interface FormPage {
  readonly id: string;
  readonly title: string;
  readonly fieldIds: readonly string[];
}

export interface PageBranch {
  readonly fromPageId: string;
  readonly when: ConditionRule;
  readonly toPageId: string | null;
}

export interface FormFlow {
  readonly pages: readonly FormPage[];
  readonly branches: readonly PageBranch[];
}

export interface ResponseSession {
  readonly currentPageId: string;
  readonly answers: Readonly<Record<string, AnswerValue | undefined>>;
  readonly visitedPageIds: readonly string[];
  readonly completed: boolean;
}

export function startSession(flow: FormFlow): ResponseSession {
  const firstPage = flow.pages[0];
  if (!firstPage) throw new Error("A multi-page flow needs at least one page.");
  return { currentPageId: firstPage.id, answers: {}, visitedPageIds: [firstPage.id], completed: false };
}

export function answerSession(session: ResponseSession, fieldId: string, value: AnswerValue): ResponseSession {
  return { ...session, answers: { ...session.answers, [fieldId]: value } };
}

export function nextSession(flow: FormFlow, session: ResponseSession): ResponseSession {
  if (session.completed) return session;
  const currentIndex = flow.pages.findIndex((page) => page.id === session.currentPageId);
  if (currentIndex < 0) throw new Error(`Unknown current page ${session.currentPageId}.`);
  const matchingBranch = flow.branches.find((branch) => branch.fromPageId === session.currentPageId && evaluateRule(branch.when, session.answers));
  const targetPageId = matchingBranch ? matchingBranch.toPageId : flow.pages[currentIndex + 1]?.id ?? null;
  if (targetPageId === null) return { ...session, completed: true };
  if (!flow.pages.some((page) => page.id === targetPageId)) throw new Error(`Unknown target page ${targetPageId}.`);
  return { ...session, currentPageId: targetPageId, visitedPageIds: [...session.visitedPageIds, targetPageId] };
}

export function backSession(session: ResponseSession): ResponseSession {
  if (session.visitedPageIds.length < 2) return session;
  const visitedPageIds = session.visitedPageIds.slice(0, -1);
  return { ...session, currentPageId: visitedPageIds.at(-1) ?? session.currentPageId, visitedPageIds, completed: false };
}

export function serializeSession(session: ResponseSession): string {
  return JSON.stringify(session);
}

export function resumeSession(flow: FormFlow, serialized: string): ResponseSession | undefined {
  try {
    const input: unknown = JSON.parse(serialized);
    if (!input || typeof input !== "object") return undefined;
    const candidate = input as Partial<ResponseSession>;
    const pageIds = new Set(flow.pages.map((page) => page.id));
    if (typeof candidate.currentPageId !== "string" || !pageIds.has(candidate.currentPageId)) return undefined;
    if (!Array.isArray(candidate.visitedPageIds) || candidate.visitedPageIds.length === 0 || !candidate.visitedPageIds.every((id) => typeof id === "string" && pageIds.has(id))) return undefined;
    if (typeof candidate.completed !== "boolean" || !candidate.answers || typeof candidate.answers !== "object") return undefined;
    if (!Object.values(candidate.answers).every((value) => value === undefined || typeof value === "string" || typeof value === "boolean")) return undefined;
    return {
      currentPageId: candidate.currentPageId,
      answers: candidate.answers,
      visitedPageIds: candidate.visitedPageIds,
      completed: candidate.completed,
    };
  } catch {
    return undefined;
  }
}

export const demoFormFlow: FormFlow = {
  pages: [
    { id: "contact", title: "About you", fieldIds: ["name", "email"] },
    { id: "role", title: "Your work", fieldIds: ["role"] },
    { id: "consent", title: "Research permission", fieldIds: ["consent"] },
  ],
  branches: [
    { fromPageId: "role", when: { kind: "notEquals", fieldId: "role", value: "engineering" }, toPageId: null },
  ],
};
