import type { Field, FormSchema } from "./schema.js";

export interface CollaborationComment {
  readonly id: string;
  readonly workspaceId: string;
  readonly formId: string;
  readonly author: string;
  readonly body: string;
  readonly mentions: readonly string[];
  readonly createdAt: string;
}

export interface SchemaChange {
  readonly kind: "form.renamed" | "field.added" | "field.removed" | "field.updated";
  readonly fieldId?: string;
  readonly summary: string;
}

export function parseMentions(body: string): readonly string[] {
  const mentions = [...body.matchAll(/(?<![\w@])@([a-zA-Z0-9_-]{1,39})\b/g)].flatMap((match) => match[1] ? [match[1].toLocaleLowerCase()] : []);
  return [...new Set(mentions)];
}

function changedProperties(before: Field, after: Field) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => key !== "id" && JSON.stringify(before[key as keyof Field]) !== JSON.stringify(after[key as keyof Field]));
}

export function diffFormSchemas(before: FormSchema, after: FormSchema): readonly SchemaChange[] {
  const changes: SchemaChange[] = [];
  if (before.title !== after.title) changes.push({ kind: "form.renamed", summary: `Renamed form from “${before.title}” to “${after.title}”.` });
  const beforeFields = new Map(before.fields.map((field) => [field.id, field]));
  const afterFields = new Map(after.fields.map((field) => [field.id, field]));
  for (const field of before.fields) {
    if (!afterFields.has(field.id)) changes.push({ kind: "field.removed", fieldId: field.id, summary: `Removed ${field.label}.` });
  }
  for (const field of after.fields) {
    const previous = beforeFields.get(field.id);
    if (!previous) {
      changes.push({ kind: "field.added", fieldId: field.id, summary: `Added ${field.label}.` });
      continue;
    }
    const properties = changedProperties(previous, field);
    if (properties.length > 0) changes.push({ kind: "field.updated", fieldId: field.id, summary: `Changed ${field.label}: ${properties.join(", ")}.` });
  }
  return changes;
}
