export type ProductArea = "builder" | "responses" | "analytics";

export type ProductCard = Readonly<{
  area: ProductArea;
  title: string;
  description: string;
  status: "ready" | "planned";
}>;

export const productCards: readonly ProductCard[] = [
  { area: "builder", title: "Form builder", description: "Compose typed fields and preview the respondent experience.", status: "ready" },
  { area: "responses", title: "Responses", description: "Inspect, filter, and export submissions.", status: "planned" },
  { area: "analytics", title: "Analytics", description: "Understand completion and drop-off with honest metrics.", status: "planned" },
];

export { demoForm, parseFormSchema, type Field, type FieldKind, type FormSchema } from "./schema.js";
export { builderReducer, createField, initialBuilderState, type BuilderAction, type BuilderState } from "./builder.js";
export { validateResponse, validateSchema, type AnswerValue, type ResponseErrors, type SchemaIssue } from "./validation.js";
export { demoWorkspace, workspaceQueryKey, type Workspace } from "./workspace.js";
