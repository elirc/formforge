import { demoForm, type FormSchema } from "./schema.js";

export type Workspace = Readonly<{
  id: string;
  name: string;
  plan: "starter" | "team";
  forms: readonly FormSchema[];
}>;

export const demoWorkspace: Workspace = { id: "acme", name: "Acme Research", plan: "team", forms: [demoForm] };

export function workspaceQueryKey(workspaceId: string) {
  return ["workspace", workspaceId] as const;
}
