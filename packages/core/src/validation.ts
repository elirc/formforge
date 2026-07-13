import type { Field, FormSchema } from "./schema.js";

export type SchemaIssue = Readonly<{ fieldId?: string; code: string; message: string }>;
export type AnswerValue = string | boolean;
export type ResponseErrors = Readonly<Record<string, string>>;

export function validateSchema(schema: FormSchema): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const seen = new Set<string>();
  if (!schema.title.trim()) issues.push({ code: "title.empty", message: "Give the form a title." });
  if (!schema.fields.some((field) => field.kind !== "content")) issues.push({ code: "fields.empty", message: "Add at least one response field." });
  for (const field of schema.fields) {
    if (seen.has(field.id)) issues.push({ fieldId: field.id, code: "field.duplicate-id", message: "Field IDs must be unique." });
    seen.add(field.id);
    if (!field.label.trim()) issues.push({ fieldId: field.id, code: "field.empty-label", message: "Give this field a label." });
    if (field.kind === "number" && field.minimum !== undefined && field.maximum !== undefined && field.minimum > field.maximum) {
      issues.push({ fieldId: field.id, code: "number.range", message: "Minimum cannot exceed maximum." });
    }
    if (field.kind === "choice") {
      const labels = field.options.map((option) => option.label.trim().toLowerCase());
      if (new Set(labels).size !== labels.length) issues.push({ fieldId: field.id, code: "choice.duplicate", message: "Choice labels must be unique." });
    }
  }
  return issues;
}

function empty(value: AnswerValue | undefined) {
  return value === undefined || value === false || (typeof value === "string" && !value.trim());
}

function validateField(field: Field, value: AnswerValue | undefined): string | undefined {
  if (field.kind === "content") return undefined;
  if (field.required && empty(value)) return "This field is required.";
  if (empty(value) || typeof value !== "string") return undefined;
  if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a complete email address.";
  if (field.kind === "text" && value.length > field.maxLength) return `Use ${field.maxLength} characters or fewer.`;
  if (field.kind === "number") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "Enter a number.";
    if (field.minimum !== undefined && parsed < field.minimum) return `Enter ${field.minimum} or more.`;
    if (field.maximum !== undefined && parsed > field.maximum) return `Enter ${field.maximum} or less.`;
  }
  if (field.kind === "choice" && !field.options.some((option) => option.id === value)) return "Select an available option.";
  if (field.kind === "date" && field.earliest && value < field.earliest) return `Choose ${field.earliest} or later.`;
  if (field.kind === "date" && field.latest && value > field.latest) return `Choose ${field.latest} or earlier.`;
  return undefined;
}

export function validateResponse(schema: FormSchema, answers: Readonly<Record<string, AnswerValue | undefined>>): ResponseErrors {
  const errors: Record<string, string> = {};
  for (const field of schema.fields) {
    const message = validateField(field, answers[field.id]);
    if (message) errors[field.id] = message;
  }
  return errors;
}
