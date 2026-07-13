export type ProductArea = "builder" | "responses" | "analytics";

export type ProductCard = Readonly<{
  area: ProductArea;
  title: string;
  description: string;
  status: "ready" | "planned";
}>;

export const productCards: readonly ProductCard[] = [
  { area: "builder", title: "Form builder", description: "Compose typed fields and preview the respondent experience.", status: "ready" },
  { area: "responses", title: "Responses", description: "Inspect, filter, and export submissions.", status: "ready" },
  { area: "analytics", title: "Analytics", description: "Understand completion and drop-off with honest metrics.", status: "ready" },
];

export { demoForm, parseFormSchema, type Field, type FieldKind, type FormSchema } from "./schema.js";
export { builderReducer, createField, initialBuilderState, type BuilderAction, type BuilderState } from "./builder.js";
export { validateResponse, validateSchema, type AnswerValue, type ResponseErrors, type SchemaIssue } from "./validation.js";
export { demoWorkspace, workspaceQueryKey, type Workspace } from "./workspace.js";
export { demoVisibilityRules, evaluateRule, isFieldVisible, validateVisibilityRules, type ComparisonRule, type ConditionRule, type RuleIssue, type VisibilityRule } from "./rules.js";
export { answerSession, backSession, demoFormFlow, nextSession, resumeSession, serializeSession, startSession, type FormFlow, type FormPage, type PageBranch, type ResponseSession } from "./flow.js";
export { demoResponses, escapeCsvCell, exportResponsesCsv, queryResponses, type ResponsePage, type ResponseQuery, type ResponseRecord } from "./responses.js";
export { buildAnalyticsReport, choiceBreakdown, demoJourneys, type AnalyticsReport, type ChoiceMetric, type PageDropoff, type ResponseJourney } from "./analytics.js";
export { diffFormSchemas, parseMentions, type CollaborationComment, type SchemaChange } from "./collaboration.js";
